function getUrgentPatient(queue, currentTime) {
  if (queue.length === 0) return null;

  // E หรือ N ที่รอ > 60 นาที → group = "E"
  const getEffectiveType = (patient) => {
    if (patient.type === "E") return "E";
    const waitTime = currentTime - patient.arrivalTime;
    return waitTime > 60 ? "E" : "N"; // N ที่รอนานได้รับการ promote ขึ้นเป็น E ชั่วคราว
  };

  let urgent = queue[0];

  for (let i = 1; i < queue.length; i++) {
    const candidate = queue[i];

    const urgentType    = getEffectiveType(urgent);
    const candidateType = getEffectiveType(candidate);

    // 1. เทียบ type (E > N)
    if (candidateType === "E" && urgentType === "N") {
      urgent = candidate;
      continue;
    }
    if (candidateType === "N" && urgentType === "E") {
      continue;
    }

    // 2. type เดียวกัน ให้เทียบ severity
    if (candidate.severity > urgent.severity) {
      urgent = candidate;
      continue;
    }
    if (candidate.severity < urgent.severity) {
      continue;
    }

    // 3.  ถ้า severity เท่ากัน ให้เทียบ arrivalTime (มาก่อนได้ก่อน)
    if (candidate.arrivalTime < urgent.arrivalTime) {
      urgent = candidate;
    }
  }

  return urgent;
}

const queue = [
  { id: 1, type: "N", severity: 9, arrivalTime: 0 },
  { id: 2, type: "E", severity: 8, arrivalTime: 100 },
  { id: 3, type: "E", severity: 9, arrivalTime: 50 },
  { id: 4, type: "N", severity: 5, arrivalTime: 110 },
];

console.log(getUrgentPatient(queue, 60));