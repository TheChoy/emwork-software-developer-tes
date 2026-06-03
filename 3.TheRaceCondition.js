async function claimInsurance(patientId, treatmentCost) {
    // Validate input ก่อนแตะ DB เลย
    if (!Number.isInteger(patientId) || patientId <= 0) {
        throw new Error("Invalid patientId");
    }
    if (typeof treatmentCost !== "number" || treatmentCost <= 0) {
        throw new Error("Invalid treatmentCost");
    }

    const client = await db.getClient(); 

    try {
        await client.query("BEGIN");

        const result = await client.query(
            `SELECT insurance_limit 
             FROM patients 
             WHERE id = $1
             FOR UPDATE`,           
            [patientId]             
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
        client.release(); 
    }
}