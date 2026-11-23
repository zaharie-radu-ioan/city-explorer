import { useEffect, useState } from 'react'
import { getStatistici } from '../api/statistici.js'

// Cifrele sunt calculate in SQL, pe server (server/rute/statistici.js).
// La fiecare tastare pleaca o cerere noua catre /api/statistici.
export default function PanouStatistici() {
  const [prag, setPrag] = useState('3')
  const [tara, setTara] = useState('')
  const [cifre, setCifre] = useState(null)
  const [eroare, setEroare] = useState(null)

  useEffect(() => {
    let anulat = false

    async function incarca() {
      try {
        const date = await getStatistici(prag, tara.trim())
        if (!anulat) {
          setCifre(date)
          setEroare(null)
        }
      } catch (err) {
        if (!anulat) {
          setEroare(err.message)
        }
      }
    }

    incarca()
    return () => {
      anulat = true
    }
  }, [prag, tara])

  return (
    <section className="panou">
      <h2>Statistici</h2>
      <label>
        Cel puțin{' '}
        <input
          type="number"
          value={prag}
          onChange={(event) => setPrag(event.target.value)}
        />{' '}
        zile
      </label>{' '}
      <label>
        Țara{' '}
        <input
          value={tara}
          placeholder="toate"
          onChange={(event) => setTara(event.target.value)}
        />
      </label>

      {eroare && <p className="stare eroare">Statistici indisponibile: {eroare}</p>}

      {!eroare && cifre && (
        <ul>
          <li>Destinații: {cifre.destinatii}</li>
          <li>Total zile: {cifre.zile}</li>
          <li>Media: {cifre.medie} zile</li>
        </ul>
      )}
    </section>
  )
}