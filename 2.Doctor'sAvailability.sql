-- Assumption:
-- doctors(doctor_id, name, specialty)
-- appointments(doctor_id, start_time, end_time, status)
-- doctor_shifts(doctor_id, start_time, end_time, shift_type)

SELECT
    d.doctor_id,
    d.name,
    d.specialty
FROM doctors d

WHERE NOT EXISTS (
    SELECT 1
    FROM appointments a
    WHERE a.doctor_id = d.doctor_id
      AND a.status = 'confirmed'
      AND a.start_time < '2026-03-19 11:00:00'
      AND a.end_time   > '2026-03-19 10:00:00'
)

AND NOT EXISTS (
    SELECT 1
    FROM doctor_shifts ds
    WHERE ds.doctor_id = d.doctor_id
      AND ds.shift_type = 'break'
      AND ds.start_time < '2026-03-19 11:00:00'
      AND ds.end_time   > '2026-03-19 10:00:00'
)
ORDER BY d.name;