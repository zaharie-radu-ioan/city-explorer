import { useEffect, useState } from 'react'
import { getNevizitate, totalZile } from './utils/destinatii.js'
import { getDestinatii, postDestinatie, patchVizitat, deleteDestinatie } from './api/destinatii.js'
import ListaDestinatii from './components/ListaDestinatii.jsx'
import FormularDestinatie from './components/FormularDestinatie.jsx'
import Rezumat from './components/Rezumat.jsx'
import Cautare from './components/Cautare.jsx'
import './App.css'

export default function App() {
  const [destinatii, setDestinatii] = useState([])
  const [incarcare, setIncarcare] = useState(true)
  const [eroare, setEroare] = useState(null)
  const [seTrimite, setSeTrimite] = useState(false)
  const [cautare, setCautare] = useState('')
  const [pagina, setPagina] = useState(1)
  const [totalPagini, setTotalPagini] = useState(1)

  useEffect(() => {
    async function incarca() {
      try {
        const rezultat = await getDestinatii(pagina)
        setDestinatii(rezultat.data)
        setTotalPagini(rezultat.pages)
      } catch (error) {
        setEroare(error.message)
      } finally {
        setIncarcare(false)
      }
    }
    incarca()
  }, [pagina])

  async function handleToggle(id) {
    const destinatie = destinatii.find((d) => d.id === id)
    try {
      const salvata = await patchVizitat(id, !destinatie.vizitat)
      setDestinatii((curent) => curent.map((d) => (d.id === id ? salvata : d)))
    } catch (error) {
      setEroare(error.message)
    }
  }

  async function handleDelete(id) {
    try {
      await deleteDestinatie(id)
      setDestinatii((curent) => curent.filter((d) => d.id !== id))
    } catch (error) {
      setEroare(error.message)
    }
  }

  async function handleAdd(destinatie) {
    setSeTrimite(true)
    try {
      const salvata = await postDestinatie(destinatie)
      setDestinatii((curent) => [...curent, salvata])
      return true
    } catch (error) {
      setEroare(error.message)
      return false
    } finally {
      setSeTrimite(false)
    }
  }

  if (incarcare) {
    return (
      <main>
        <h1>City Explorer</h1>
        <p className="stare">Se încarcă destinațiile...</p>
      </main>
    )
  }

  if (eroare) {
    return (
      <main>
        <h1>City Explorer</h1>
        <p className="stare eroare">Nu am putut încărca datele: {eroare}</p>
      </main>
    )
  }

  const nevizitate = getNevizitate(destinatii)

  const text = cautare.trim().toLowerCase()
  const afisate = destinatii.filter(
    (d) => d.oras.toLowerCase().includes(text) ||
      d.tara.toLowerCase().includes(text),
  )

  return (
    <main>
      <h1>City Explorer</h1>
      <Rezumat
        total={destinatii.length}
        nevizitate={nevizitate.length}
        zile={totalZile(nevizitate)}
      />
      <FormularDestinatie onAdd={handleAdd} seTrimite={seTrimite} />
      <Cautare valoare={cautare} onChange={setCautare} />

      {destinatii.length === 0 ? (
        <p className="gol">Nu există nicio destinație. Adaugă prima din formular.</p>
      ) : afisate.length === 0 ? (
        <p className="gol">Niciun rezultat pentru „{cautare.trim()}”.</p>
      ) : (
        <ListaDestinatii destinatii={afisate} onToggle={handleToggle} onDelete={handleDelete} />
      )}

      <div className="paginare">
        <button type="button" disabled={pagina === 1} onClick={() => setPagina(pagina - 1)}>
          Înapoi
        </button>
        <span>pagina {pagina} din {totalPagini}</span>
        <button type="button" disabled={pagina === totalPagini} onClick={() => setPagina(pagina + 1)}>
          Înainte
        </button>
      </div>
    </main>
  )
}