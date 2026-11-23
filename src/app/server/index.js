import express from 'express'
import cors from 'cors'
import { pool } from './db.js'
import { jurnal } from './jurnal.js'
import statistici from './rute/statistici.js'
import rutaJurnal from './rute/jurnal.js'

const app = express()

app.use((req, res, next) => {
  console.log(req.method, req.originalUrl)
  next()

app.use(jurnal)
app.use(cors())
app.use(express.json())

const curata = (d) => ({ ...d, id: String(d.id), vizitat: Boolean(d.vizitat) })

app.all('/api/ecou/:id', (req, res) => {
  res.json({ params: req.params, query: req.query, body: req.body })
})

app.get('/api/destinatii', async (req, res) => {
  const [randuri] = await pool.query(
    'SELECT id, oras, tara, zile, vizitat FROM destinatii ORDER BY id',
  )

  res.json(randuri.map(curata))
})


app.get('/api/destinatii/caut', async (req, res) => {
  const oras = req.query.oras ?? ''

  if (oras === '') {
    return res.status(400).json({ eroare: 'Parametrul oras lipsește.' })
  }

  const [randuri] = await pool.query(
    'SELECT id, oras, tara, zile, vizitat FROM destinatii WHERE oras = ?',
    [oras],
  )

  res.json(randuri.map(curata))
})

app.post('/api/destinatii', async (req, res) => {
  const { oras, tara, zile } = req.body

  if (
    typeof oras !== 'string' || oras.trim() === '' ||
    typeof tara !== 'string' || tara.trim() === '' ||
    !Number.isInteger(zile) || zile < 1 || zile > 30
  ) {
    return res.status(400).json({ eroare: 'Date invalide.' })
  }

  const [rezultat] = await pool.query(
    'INSERT INTO destinatii (oras, tara, zile, vizitat) VALUES (?, ?, ?, ?)',
    [oras.trim(), tara.trim(), zile, false],
  )

  res.status(201).json({
    id: String(rezultat.insertId),
    oras: oras.trim(),
    tara: tara.trim(),
    zile,
    vizitat: false,
  })
})

app.patch('/api/destinatii/:id', async (req, res) => {
  const id = Number(req.params.id)
  const { vizitat } = req.body

  if (!Number.isInteger(id) || typeof vizitat !== 'boolean') {
    return res.status(400).json({ eroare: 'Date invalide.' })
  }

  const [rezultat] = await pool.query(
    'UPDATE destinatii SET vizitat = ? WHERE id = ?',
    [vizitat, id],
  )

  if (rezultat.affectedRows === 0) {
    return res.status(404).json({ eroare: `Destinația ${req.params.id} nu există.` })
  }

  const [randuri] = await pool.query(
    'SELECT id, oras, tara, zile, vizitat FROM destinatii WHERE id = ?',
    [id],
  )

  res.json(curata(randuri[0]))
})

app.delete('/api/destinatii/:id', async (req, res) => {
  const id = Number(req.params.id)

  if (!Number.isInteger(id)) {
    return res.status(400).json({ eroare: 'Date invalide.' })
  }

  const [rezultat] = await pool.query('DELETE FROM destinatii WHERE id = ?', [id])

  if (rezultat.affectedRows === 0) {
    return res.status(404).json({ eroare: `Destinația ${req.params.id} nu există.` })
  }

  res.status(204).end()
})

app.use('/api/statistici', statistici)

app.use('/api/jurnal', rutaJurnal)

const PORT = Number(process.env.PORT) || 3000

app.listen(PORT, () => {
  console.log(`API pornit pe http://localhost:${PORT}`)
})