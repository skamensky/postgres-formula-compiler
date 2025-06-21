SELECT
  (
    t1.business_name
    || ' - '
    || CAST(submission.amount * 0.05 AS TEXT)
    || ' - '
    || (
      SELECT
        STRING_AGG(r.name, ', ')
      FROM rep_link rl
      LEFT JOIN rep r ON rl.rep = r.id
      WHERE rl.submission = submission.id
    )
  ) AS formula1_result,
  (
    (
      CASE
        WHEN submission.amount > 1000
        THEN t1.business_name || ' (HIGH VALUE)'
        ELSE t1.city
      END
      || ' | Rep Count: '
      || CAST(
        (
          SELECT
            COUNT(r2.id)
          FROM rep_link rl2
          LEFT JOIN rep r2 ON rl2.rep = r2.id
          WHERE rl2.submission = submission.id
        ) AS TEXT
      )
    )
  ) AS formula2_result
FROM submission
LEFT JOIN merchant t1
  ON submission.merchant = t1.id;
