import { pool } from './db.js'

export function jurnal(req, res, next) {
  const inceput = process.hrtime.bigint()

  const cale = req.originalUrl.split('?')[0]

  res.on('finish', async () => {
    const durata = Number(process.hrtime.bigint() - inceput) / 1e6
    try {
      await pool.query(
        'INSERT INTO jurnal (metoda, cale, status, durata_ms) VALUES (?, ?, ?, ?)',
        [req.method, cale, res.statusCode, Math.round(durata)],
      )
    } catch (err) {

      console.error('Jurnal: nu am putut scrie randul:', err.message)
    }
  })

  next()
}
