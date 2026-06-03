async function claimInsurance(patientId, treatmentCost) {
    // Validate input ก่อนแตะ DB เลย
    if (!Number.isInteger(patientId) || patientId <= 0) {
        throw new Error("Invalid patientId");
    }
    if (typeof treatmentCost !== "number" || treatmentCost <= 0) {
        throw new Error("Invalid treatmentCost");
    }

    const client = await db.getClient(); // ดึง connection สำหรับ transaction

    try {
        await client.query("BEGIN");

        // ✅ แก้ SQL Injection → ใช้ Parameterized Query ($1, $2)
        // ✅ แก้ Race Condition  → SELECT FOR UPDATE ล็อคแถวนี้ไว้ก่อนใครอ่าน
        const result = await client.query(
            `SELECT insurance_limit 
             FROM patients 
             WHERE id = $1
             FOR UPDATE`,           // ← row-level lock
            [patientId]             // ← parameterized (ป้องกัน SQL Injection)
        );

        if (result.rows.length === 0) {
            await client.query("ROLLBACK");
            throw new Error("Patient not found");
        }

        const currentLimit = result.rows[0].insurance_limit;

        if (currentLimit < treatmentCost) {
            await client.query("ROLLBACK");
            return { success: false, reason: "Insufficient insurance limit" };
        }

        // ✅ คำนวณและอัปเดตภายใน transaction เดียวกัน
        await client.query(
            `UPDATE patients 
             SET insurance_limit = insurance_limit - $1
             WHERE id = $2`,
            [treatmentCost, patientId]
        );

        await client.query("COMMIT");
        return { success: true, remainingLimit: currentLimit - treatmentCost };

    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release(); // คืน connection กลับ pool เสมอ
    }
}