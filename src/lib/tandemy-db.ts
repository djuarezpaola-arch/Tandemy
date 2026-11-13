import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { auth, db, googleProvider, handleFirestoreError, OperationType } from "./firebase";
import {
  computeFeeBreakdown,
  type AccountRole,
  type PaymentMethodId,
  type PAYMENT_METHODS,
  type ProjectApplication,
  type SimulatedPayment,
  type TandemyProject,
  type UserProfile,
} from "./tandemy-types";

function clampText(value: string | undefined | null, maxLen: number): string {
  return String(value ?? "")
    .trim()
    .slice(0, maxLen);
}

function clampList(items: string[] | undefined | null, maxItems: number, maxLen: number): string[] {
  if (!Array.isArray(items)) return [];
  return items
    .map((s) => clampText(s, maxLen))
    .filter((s) => s.length > 0)
    .slice(0, maxItems);
}

export function parseSkillsInput(raw: string): string[] {
  return clampList(
    raw
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean),
    20,
    80,
  );
}

export function authErrorToSpanish(error: unknown): string {
  const code = (error as { code?: string } | null)?.code ?? "";
  const message = error instanceof Error ? error.message : String(error ?? "");
  if (code === "auth/email-already-in-use") {
    return "Ya existe una cuenta registrada con este correo electrónico. Inicia sesión.";
  }
  if (
    code === "auth/invalid-credential" ||
    code === "auth/wrong-password" ||
    code === "auth/user-not-found"
  ) {
    return "Correo electrónico o contraseña incorrectos.";
  }
  if (code === "auth/weak-password") {
    return "La contraseña debe tener al menos 6 caracteres.";
  }
  if (code === "auth/invalid-email") {
    return "El formato del correo electrónico no es válido.";
  }
  if (code === "auth/operation-not-allowed") {
    return "El inicio con correo y contraseña aún no está activado en Firebase Console. Activa el proveedor Email/Password en Firebase Authentication o usa 'Continuar con Google'.";
  }
  if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
    return "Se cerró la ventana de inicio de sesión con Google antes de completar el acceso.";
  }
  if (code === "auth/too-many-requests") {
    return "Demasiados intentos seguidos. Espera un momento e inténtalo de nuevo.";
  }
  if (message.includes("Missing or insufficient permissions")) {
    return "No tienes permisos suficientes para completar esta operación.";
  }
  return message || "No pudimos completar la solicitud. Inténtalo nuevamente.";
}

export interface StudentRegisterInput {
  email: string;
  password: string;
  displayName: string;
  studentNumber: string;
  degree: string;
  semester: string;
  university: string;
  bio: string;
  skills: string[];
  experience: string;
}

export interface PymeRegisterInput {
  email: string;
  password: string;
  companyName: string;
  businessType: string;
  companyDescription: string;
  phone: string;
  rfc: string;
  city: string;
}

export async function registerStudentAccount(input: StudentRegisterInput) {
  const cred = await createUserWithEmailAndPassword(auth, input.email.trim(), input.password);
  const displayName = clampText(input.displayName, 120) || "Estudiante FCA";
  await updateProfile(cred.user, { displayName });
  await saveStudentAccountDocs(cred.user.uid, input.email.trim(), input);
  return cred.user;
}

export async function saveStudentAccountDocs(
  uid: string,
  email: string,
  input: Omit<StudentRegisterInput, "email" | "password">,
) {
  const batch = writeBatch(db);
  const profileRef = doc(db, "profiles", uid);
  const privateRef = doc(db, "privateAccounts", uid);

  batch.set(profileRef, {
    uid,
    role: "student" as AccountRole,
    displayName: clampText(input.displayName, 120),
    photoUrl: "",
    university: clampText(input.university || "Universidad Autónoma de Chihuahua (FCA)", 120),
    degree: clampText(input.degree, 120),
    semester: clampText(input.semester, 40),
    bio: clampText(input.bio, 1500),
    skills: clampList(input.skills, 20, 80),
    experience: clampText(input.experience, 1500),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  batch.set(privateRef, {
    uid,
    role: "student" as AccountRole,
    email: clampText(email, 160),
    studentNumber: clampText(input.studentNumber, 40),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `profiles/${uid}`);
  }
}

export async function registerPymeAccount(input: PymeRegisterInput) {
  const cred = await createUserWithEmailAndPassword(auth, input.email.trim(), input.password);
  const companyName = clampText(input.companyName, 120) || "PyME Chihuahua";
  await updateProfile(cred.user, { displayName: companyName });
  await savePymeAccountDocs(cred.user.uid, input.email.trim(), input);
  return cred.user;
}

export async function savePymeAccountDocs(
  uid: string,
  email: string,
  input: Omit<PymeRegisterInput, "email" | "password">,
) {
  const batch = writeBatch(db);
  const profileRef = doc(db, "profiles", uid);
  const privateRef = doc(db, "privateAccounts", uid);
  const companyName = clampText(input.companyName, 120);

  batch.set(profileRef, {
    uid,
    role: "pyme" as AccountRole,
    displayName: companyName,
    companyName,
    photoUrl: "",
    businessType: clampText(input.businessType, 120),
    companyDescription: clampText(input.companyDescription, 1500),
    city: clampText(input.city || "Chihuahua, Chih.", 120),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  batch.set(privateRef, {
    uid,
    role: "pyme" as AccountRole,
    email: clampText(email, 160),
    phone: clampText(input.phone, 40),
    rfc: clampText(input.rfc.toUpperCase(), 20),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `profiles/${uid}`);
  }
}

export async function loginWithEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  const snap = await getDoc(doc(db, "profiles", cred.user.uid));
  const profile = snap.exists() ? (snap.data() as UserProfile) : null;
  return { user: cred.user, profile };
}

export async function loginWithGoogle() {
  const cred = await signInWithPopup(auth, googleProvider);
  const snap = await getDoc(doc(db, "profiles", cred.user.uid));
  const profile = snap.exists() ? (snap.data() as UserProfile) : null;
  return { user: cred.user, profile, needsOnboarding: !profile };
}

export async function logoutAccount() {
  await signOut(auth);
}

export async function updateStudentProfile(
  uid: string,
  updates: {
    displayName: string;
    photoUrl?: string;
    university: string;
    degree: string;
    semester: string;
    bio: string;
    skills: string[];
    experience: string;
    studentNumber: string;
  },
) {
  const batch = writeBatch(db);
  batch.update(doc(db, "profiles", uid), {
    displayName: clampText(updates.displayName, 120),
    photoUrl: clampText(updates.photoUrl ?? "", 60000),
    university: clampText(updates.university, 120),
    degree: clampText(updates.degree, 120),
    semester: clampText(updates.semester, 40),
    bio: clampText(updates.bio, 1500),
    skills: clampList(updates.skills, 20, 80),
    experience: clampText(updates.experience, 1500),
    updatedAt: serverTimestamp(),
  });
  batch.update(doc(db, "privateAccounts", uid), {
    studentNumber: clampText(updates.studentNumber, 40),
    updatedAt: serverTimestamp(),
  });
  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `profiles/${uid}`);
  }
}

export async function updatePymeProfile(
  uid: string,
  updates: {
    companyName: string;
    photoUrl?: string;
    businessType: string;
    companyDescription: string;
    city: string;
    phone: string;
    rfc: string;
  },
) {
  const batch = writeBatch(db);
  const name = clampText(updates.companyName, 120);
  batch.update(doc(db, "profiles", uid), {
    displayName: name,
    companyName: name,
    photoUrl: clampText(updates.photoUrl ?? "", 60000),
    businessType: clampText(updates.businessType, 120),
    companyDescription: clampText(updates.companyDescription, 1500),
    city: clampText(updates.city, 120),
    updatedAt: serverTimestamp(),
  });
  batch.update(doc(db, "privateAccounts", uid), {
    phone: clampText(updates.phone, 40),
    rfc: clampText(updates.rfc.toUpperCase(), 20),
    updatedAt: serverTimestamp(),
  });
  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `profiles/${uid}`);
  }
}

export async function compressImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("El archivo no es una imagen válida."));
      img.onload = () => {
        const maxSide = 160;
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("No se pudo procesar la imagen."));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export interface CreateProjectInput {
  title: string;
  description: string;
  area: string;
  activities: string;
  requiredSkills: string[];
  targetDegrees: string[];
  budget: number;
  duration: string;
  deadline: string;
}

export async function publishProject(pymeProfile: UserProfile, input: CreateProjectInput) {
  const ref = doc(collection(db, "projects"));
  const payload = {
    ownerId: pymeProfile.uid,
    companyName: clampText(pymeProfile.companyName || pymeProfile.displayName, 120),
    companySector: clampText(pymeProfile.businessType || "PyME Chihuahua", 120),
    title: clampText(input.title, 140),
    description: clampText(input.description, 3000),
    area: clampText(input.area, 80),
    activities: clampText(input.activities, 2000),
    requiredSkills: clampList(input.requiredSkills, 15, 80),
    targetDegrees: clampList(input.targetDegrees, 6, 120),
    budget: Math.max(100, Math.min(10000000, Math.round(Number(input.budget) || 0))),
    duration: clampText(input.duration, 60),
    deadline: clampText(input.deadline, 30),
    status: "open",
    selectedApplicationId: null,
    selectedStudentId: null,
    selectedStudentName: null,
    studentConfirmedComplete: false,
    pymeConfirmedComplete: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    const batch = writeBatch(db);
    batch.set(ref, payload);
    await batch.commit();
    return ref.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `projects/${ref.id}`);
  }
}

export async function editOpenProject(projectId: string, input: CreateProjectInput) {
  try {
    await updateDoc(doc(db, "projects", projectId), {
      title: clampText(input.title, 140),
      description: clampText(input.description, 3000),
      area: clampText(input.area, 80),
      activities: clampText(input.activities, 2000),
      requiredSkills: clampList(input.requiredSkills, 15, 80),
      targetDegrees: clampList(input.targetDegrees, 6, 120),
      budget: Math.max(100, Math.min(10000000, Math.round(Number(input.budget) || 0))),
      duration: clampText(input.duration, 60),
      deadline: clampText(input.deadline, 30),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `projects/${projectId}`);
  }
}

export async function closeOpenProject(projectId: string) {
  try {
    await updateDoc(doc(db, "projects", projectId), {
      status: "closed",
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `projects/${projectId}`);
  }
}

export async function deleteOpenProject(projectId: string) {
  try {
    await deleteDoc(doc(db, "projects", projectId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `projects/${projectId}`);
  }
}

export async function applyToProject(params: {
  project: TandemyProject;
  studentProfile: UserProfile;
  proposedAmount: number;
  proposedDuration: string;
  coverLetter: string;
}) {
  const { project, studentProfile, proposedAmount, proposedDuration, coverLetter } = params;

  if (studentProfile.role !== "student") {
    throw new Error("Solo las cuentas de estudiante pueden postularse a proyectos.");
  }

  const cleanedLetter = clampText(coverLetter, 2000);
  if (cleanedLetter.length < 5) {
    throw new Error("Escribe una propuesta de al menos 5 caracteres.");
  }

  const numericAmount = Number(proposedAmount);
  const safeAmount = Math.max(
    100,
    Math.min(
      10000000,
      Math.round(
        Number.isFinite(numericAmount) && numericAmount > 0 ? numericAmount : project.budget,
      ),
    ),
  );
  const safeStudentName = clampText(studentProfile.displayName, 120) || "Estudiante FCA";
  const safeDuration = clampText(proposedDuration || project.duration, 60) || "7 días";
  const safeProjectTitle = clampText(project.title, 140) || "Proyecto Tandemy";
  const safeCompanyName = clampText(project.companyName, 120) || "PyME Tandemy";

  const appId = `${project.id}_${studentProfile.uid}`;
  const batch = writeBatch(db);

  batch.set(doc(db, "applications", appId), {
    projectId: project.id,
    projectTitle: safeProjectTitle,
    pymeId: project.ownerId,
    companyName: safeCompanyName,
    studentId: studentProfile.uid,
    studentName: safeStudentName,
    studentDegree: clampText(studentProfile.degree ?? "", 120),
    studentSemester: clampText(studentProfile.semester ?? "", 40),
    studentSkills: clampList(studentProfile.skills, 20, 80),
    proposedAmount: safeAmount,
    proposedDuration: safeDuration,
    coverLetter: cleanedLetter,
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const isShowcaseDemo = project.ownerId === "demo-pyme";
  const notifRef = doc(collection(db, "notifications"));
  batch.set(notifRef, {
    recipientId: isShowcaseDemo ? studentProfile.uid : project.ownerId,
    senderId: studentProfile.uid,
    type: "new_application",
    title: isShowcaseDemo ? "Postulación registrada" : "Nueva postulación recibida",
    body: clampText(
      isShowcaseDemo
        ? `Tu propuesta para "${safeProjectTitle}" con ${safeCompanyName} fue guardada en Mis postulaciones.`
        : `${safeStudentName} se postuló a "${safeProjectTitle}".`,
      500,
    ),
    linkPath: isShowcaseDemo ? "/panel-estudiante" : "/panel-pyme",
    relatedProjectId: project.id,
    read: false,
    createdAt: serverTimestamp(),
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `applications/${appId}`);
  }
}

export async function acceptStudentApplication(params: {
  project: TandemyProject;
  application: ProjectApplication;
  otherApplications: ProjectApplication[];
}) {
  const { project, application, otherApplications } = params;
  const batch = writeBatch(db);

  // 1. Accept selected application
  batch.update(doc(db, "applications", application.id), {
    status: "accepted",
    updatedAt: serverTimestamp(),
  });

  // 2. Reject other pending applications for this project
  for (const other of otherApplications) {
    if (other.id !== application.id && other.status === "pending") {
      batch.update(doc(db, "applications", other.id), {
        status: "rejected",
        updatedAt: serverTimestamp(),
      });
      const rejectNotif = doc(collection(db, "notifications"));
      batch.set(rejectNotif, {
        recipientId: other.studentId,
        senderId: project.ownerId,
        type: "application_rejected",
        title: "Actualización de postulación",
        body: `La empresa ${project.companyName} eligió otra propuesta para "${project.title}".`,
        linkPath: "/panel-estudiante",
        relatedProjectId: project.id,
        read: false,
        createdAt: serverTimestamp(),
      });
    }
  }

  // 3. Activate project
  batch.update(doc(db, "projects", project.id), {
    status: "in_progress",
    selectedApplicationId: application.id,
    selectedStudentId: application.studentId,
    selectedStudentName: clampText(application.studentName, 120),
    updatedAt: serverTimestamp(),
  });

  // 4. Create pending simulated payment record
  const { amount, platformFee, studentNetAmount } = computeFeeBreakdown(
    application.proposedAmount || project.budget,
  );
  batch.set(doc(db, "payments", project.id), {
    projectId: project.id,
    projectTitle: clampText(project.title, 140),
    pymeId: project.ownerId,
    companyName: clampText(project.companyName, 120),
    studentId: application.studentId,
    studentName: clampText(application.studentName, 120),
    amount,
    platformFee,
    studentNetAmount,
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // 5. Notify selected student
  const acceptNotif = doc(collection(db, "notifications"));
  batch.set(acceptNotif, {
    recipientId: application.studentId,
    senderId: project.ownerId,
    type: "application_accepted",
    title: "¡Fuiste seleccionado para un proyecto!",
    body: `${project.companyName} aceptó tu postulación para "${project.title}". El proyecto ya está activo en tu panel.`,
    linkPath: "/panel-estudiante",
    relatedProjectId: project.id,
    read: false,
    createdAt: serverTimestamp(),
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `projects/${project.id}`);
  }
}

export async function rejectStudentApplication(application: ProjectApplication, pymeId: string) {
  const batch = writeBatch(db);
  batch.update(doc(db, "applications", application.id), {
    status: "rejected",
    updatedAt: serverTimestamp(),
  });
  const notifRef = doc(collection(db, "notifications"));
  batch.set(notifRef, {
    recipientId: application.studentId,
    senderId: pymeId,
    type: "application_rejected",
    title: "Postulación rechazada",
    body: `${application.companyName} revisó tu postulación para "${application.projectTitle}" y no fue seleccionada.`,
    linkPath: "/panel-estudiante",
    relatedProjectId: application.projectId,
    read: false,
    createdAt: serverTimestamp(),
  });
  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `applications/${application.id}`);
  }
}

export async function payProjectSimulated(params: {
  payment: SimulatedPayment;
  project: TandemyProject;
  methodLabel: string;
}) {
  const { payment, project, methodLabel } = params;
  const refSuffix = Math.floor(100000 + Math.random() * 900000);
  const referenceCode = `TDM-${new Date().getFullYear()}-${refSuffix}`;
  const isProjectCompleted = project.status === "completed";
  const nextStatus = isProjectCompleted ? "released" : "pending_release";

  const batch = writeBatch(db);
  batch.update(doc(db, "payments", payment.id), {
    status: nextStatus,
    paymentMethod: clampText(methodLabel, 80),
    referenceCode,
    paidAt: serverTimestamp(),
    ...(isProjectCompleted ? { releasedAt: serverTimestamp() } : {}),
    updatedAt: serverTimestamp(),
  });

  const notifRef = doc(collection(db, "notifications"));
  batch.set(notifRef, {
    recipientId: payment.studentId,
    senderId: payment.pymeId,
    type: isProjectCompleted ? "payment_released" : "payment_deposited",
    title: isProjectCompleted ? "Pago liberado a tu cuenta" : "Pago en garantía registrado",
    body: isProjectCompleted
      ? `${payment.companyName} completó el pago de "${payment.projectTitle}" y tu ganancia neta de $${payment.studentNetAmount.toLocaleString("es-MX")} MXN ha sido liberada.`
      : `${payment.companyName} realizó el pago de "${payment.projectTitle}" (${methodLabel}). Se liberará al finalizar el proyecto.`,
    linkPath: "/panel-estudiante",
    relatedProjectId: payment.projectId,
    read: false,
    createdAt: serverTimestamp(),
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `payments/${payment.id}`);
  }

  return {
    referenceCode,
    status: nextStatus,
    dateText: new Date().toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };
}

export async function confirmProjectCompletion(params: {
  project: TandemyProject;
  actorRole: AccountRole;
  actorId: string;
  studentProfile?: UserProfile | null;
  payment?: SimulatedPayment | null;
}) {
  const { project, actorRole, actorId, studentProfile, payment } = params;
  const alreadyOtherConfirmed =
    actorRole === "pyme" ? project.studentConfirmedComplete : project.pymeConfirmedComplete;
  const willComplete = Boolean(alreadyOtherConfirmed);

  const batch = writeBatch(db);
  const projectRef = doc(db, "projects", project.id);

  batch.update(projectRef, {
    ...(actorRole === "pyme"
      ? { pymeConfirmedComplete: true }
      : { studentConfirmedComplete: true }),
    status: willComplete ? "completed" : "in_progress",
    updatedAt: serverTimestamp(),
  });

  const otherPartyId = actorRole === "pyme" ? project.selectedStudentId : project.ownerId;

  if (willComplete && project.selectedStudentId) {
    // Release payment if already paid/pending_release
    if (payment && (payment.status === "pending_release" || payment.status === "paid")) {
      batch.update(doc(db, "payments", payment.id), {
        status: "released",
        releasedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    // Automatically generate digital certificate
    const certificateCode = `CERT-TDM-${project.id.slice(0, 6).toUpperCase()}-${new Date().getFullYear()}`;
    const completedAt = new Date().toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    batch.set(doc(db, "certificates", project.id), {
      certificateCode,
      projectId: project.id,
      projectTitle: clampText(project.title, 140),
      activitiesSummary: clampText(project.activities || project.description, 2000),
      studentId: project.selectedStudentId,
      studentName: clampText(
        studentProfile?.displayName || project.selectedStudentName || "Estudiante FCA UACH",
        120,
      ),
      studentDegree: clampText(studentProfile?.degree || "FCA UACH", 120),
      studentUniversity: clampText(
        studentProfile?.university || "Universidad Autónoma de Chihuahua",
        120,
      ),
      pymeId: project.ownerId,
      companyName: clampText(project.companyName, 120),
      completedAt,
      issuedAt: serverTimestamp(),
    });

    if (otherPartyId) {
      const n1 = doc(collection(db, "notifications"));
      batch.set(n1, {
        recipientId: otherPartyId,
        senderId: actorId,
        type: "project_completed",
        title: "Proyecto finalizado y validado",
        body: `"${project.title}" fue confirmado por ambas partes. Ya pueden calificarse y el certificado digital ha sido emitido.`,
        linkPath: actorRole === "pyme" ? "/panel-estudiante" : "/panel-pyme",
        relatedProjectId: project.id,
        read: false,
        createdAt: serverTimestamp(),
      });
    }
  } else if (otherPartyId) {
    const n2 = doc(collection(db, "notifications"));
    batch.set(n2, {
      recipientId: otherPartyId,
      senderId: actorId,
      type: "completion_requested",
      title: "Confirmación de término pendiente",
      body: `${actorRole === "pyme" ? project.companyName : project.selectedStudentName || "El estudiante"} marcó "${project.title}" como terminado. Confirma la finalización en tu panel.`,
      linkPath: actorRole === "pyme" ? "/panel-estudiante" : "/panel-pyme",
      relatedProjectId: project.id,
      read: false,
      createdAt: serverTimestamp(),
    });
  }

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `projects/${project.id}`);
  }
}

export async function submitProjectReview(params: {
  project: TandemyProject;
  reviewerProfile: UserProfile;
  revieweeId: string;
  revieweeName: string;
  rating: number;
  comment: string;
}) {
  const { project, reviewerProfile, revieweeId, revieweeName, rating, comment } = params;
  const reviewId = `${project.id}_${reviewerProfile.uid}`;
  const batch = writeBatch(db);

  batch.set(doc(db, "reviews", reviewId), {
    projectId: project.id,
    projectTitle: clampText(project.title, 140),
    reviewerId: reviewerProfile.uid,
    reviewerName: clampText(
      reviewerProfile.role === "pyme"
        ? reviewerProfile.companyName || reviewerProfile.displayName
        : reviewerProfile.displayName,
      120,
    ),
    reviewerRole: reviewerProfile.role,
    revieweeId,
    revieweeName: clampText(revieweeName, 120),
    rating: Math.max(1, Math.min(5, Math.round(rating))),
    comment: clampText(comment, 1000),
    createdAt: serverTimestamp(),
  });

  const notifRef = doc(collection(db, "notifications"));
  batch.set(notifRef, {
    recipientId: revieweeId,
    senderId: reviewerProfile.uid,
    type: "new_review",
    title: "Nueva calificación recibida",
    body: `Recibiste una calificación de ${rating} estrellas por "${project.title}".`,
    linkPath: reviewerProfile.role === "pyme" ? "/panel-estudiante" : "/panel-pyme",
    relatedProjectId: project.id,
    read: false,
    createdAt: serverTimestamp(),
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `reviews/${reviewId}`);
  }
}

export async function sendProjectMessage(params: {
  project: TandemyProject;
  senderProfile: UserProfile;
  recipientId: string;
  body: string;
}) {
  const { project, senderProfile, recipientId, body } = params;
  const senderName =
    senderProfile.role === "pyme"
      ? senderProfile.companyName || senderProfile.displayName
      : senderProfile.displayName;

  const batch = writeBatch(db);
  const msgRef = doc(collection(db, "messages"));
  batch.set(msgRef, {
    projectId: project.id,
    senderId: senderProfile.uid,
    senderName: clampText(senderName, 120),
    senderRole: senderProfile.role,
    recipientId,
    body: clampText(body, 1500),
    createdAt: serverTimestamp(),
  });

  const notifRef = doc(collection(db, "notifications"));
  batch.set(notifRef, {
    recipientId,
    senderId: senderProfile.uid,
    type: "new_message",
    title: `Nuevo mensaje en "${project.title}"`,
    body: `${senderName}: ${clampText(body, 120)}`,
    linkPath: senderProfile.role === "pyme" ? "/panel-estudiante" : "/panel-pyme",
    relatedProjectId: project.id,
    read: false,
    createdAt: serverTimestamp(),
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `messages/${msgRef.id}`);
  }
}

export async function markNotificationRead(notificationId: string) {
  try {
    await updateDoc(doc(db, "notifications", notificationId), { read: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `notifications/${notificationId}`);
  }
}
