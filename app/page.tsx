'use client'

import { useState } from 'react'
import styles from './page.module.css'

interface Person {
  id: number
  name: string
}

interface Item {
  id: number
  name: string
  amount: string
  assignedTo: number[] // person ids
}

export default function Home() {
  const [billTotal, setBillTotal] = useState('')
  const [tip, setTip] = useState('')
  const [people, setPeople] = useState<Person[]>([
    { id: 1, name: 'You' },
    { id: 2, name: 'Friend 1' },
  ])
  const [items, setItems] = useState<Item[]>([
    { id: 1, name: '', amount: '', assignedTo: [] },
  ])
  const [mode, setMode] = useState<'equal' | 'custom'>('equal')
  const [calculated, setCalculated] = useState(false)

  const addPerson = () => {
    const newId = Date.now()
    setPeople([...people, { id: newId, name: `Friend ${people.length}` }])
  }

  const removePerson = (id: number) => {
    if (people.length <= 2) return
    setPeople(people.filter(p => p.id !== id))
    setItems(items.map(item => ({
      ...item,
      assignedTo: item.assignedTo.filter(pid => pid !== id)
    })))
  }

  const updatePersonName = (id: number, name: string) => {
    setPeople(people.map(p => p.id === id ? { ...p, name } : p))
  }

  const addItem = () => {
    setItems([...items, { id: Date.now(), name: '', amount: '', assignedTo: [] }])
  }

  const removeItem = (id: number) => {
    if (items.length <= 1) return
    setItems(items.filter(i => i.id !== id))
  }

  const updateItem = (id: number, field: 'name' | 'amount', value: string) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i))
  }

  const togglePersonOnItem = (itemId: number, personId: number) => {
    setItems(items.map(item => {
      if (item.id !== itemId) return item
      const already = item.assignedTo.includes(personId)
      return {
        ...item,
        assignedTo: already
          ? item.assignedTo.filter(id => id !== personId)
          : [...item.assignedTo, personId]
      }
    }))
  }

  const tipAmount = parseFloat(tip) || 0
  const totalBill = parseFloat(billTotal) || 0
  const grandTotal = totalBill + tipAmount

  const calcResults = () => {
    if (mode === 'equal') {
      return people.map(p => ({
        person: p,
        amount: grandTotal / people.length
      }))
    } else {
      // Custom: sum items per person
      const shares: Record<number, number> = {}
      people.forEach(p => { shares[p.id] = 0 })

      items.forEach(item => {
        const amt = parseFloat(item.amount) || 0
        if (item.assignedTo.length === 0) return
        const perPerson = amt / item.assignedTo.length
        item.assignedTo.forEach(pid => {
          shares[pid] = (shares[pid] || 0) + perPerson
        })
      })

      // Distribute tip proportionally
      const itemsTotal = Object.values(shares).reduce((a, b) => a + b, 0)
      if (itemsTotal > 0 && tipAmount > 0) {
        people.forEach(p => {
          shares[p.id] = shares[p.id] + (shares[p.id] / itemsTotal) * tipAmount
        })
      }

      return people.map(p => ({
        person: p,
        amount: shares[p.id] || 0
      }))
    }
  }

  const results = calcResults()

  const itemsTotal = items.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0)

  return (
    <main className={styles.main}>
      <div className={styles.container}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logo}>SplitEasy</div>
          <p className={styles.tagline}>Split any bill. Zero drama.</p>
        </div>

        {/* Mode Toggle */}
        <div className={styles.modeToggle}>
          <button
            className={`${styles.modeBtn} ${mode === 'equal' ? styles.modeBtnActive : ''}`}
            onClick={() => setMode('equal')}
          >
            Split Equally
          </button>
          <button
            className={`${styles.modeBtn} ${mode === 'custom' ? styles.modeBtnActive : ''}`}
            onClick={() => setMode('custom')}
          >
            Split by Item
          </button>
        </div>

        {/* People */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>People</span>
            <button className={styles.addBtn} onClick={addPerson}>+ Add</button>
          </div>
          <div className={styles.peopleGrid}>
            {people.map((p, i) => (
              <div key={p.id} className={styles.personChip}>
                <input
                  type="text"
                  value={p.name}
                  onChange={e => updatePersonName(p.id, e.target.value)}
                  className={styles.personInput}
                />
                {people.length > 2 && (
                  <button className={styles.removeBtn} onClick={() => removePerson(p.id)}>×</button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Bill Total (equal mode) */}
        {mode === 'equal' && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>Bill Total</span>
            </div>
            <div className={styles.amountRow}>
              <div className={styles.inputWrap}>
                <span className={styles.currency}>₹</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={billTotal}
                  onChange={e => setBillTotal(e.target.value)}
                  className={styles.amountInput}
                />
              </div>
            </div>
          </section>
        )}

        {/* Items (custom mode) */}
        {mode === 'custom' && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>Items</span>
              <button className={styles.addBtn} onClick={addItem}>+ Add item</button>
            </div>
            <div className={styles.itemsList}>
              {items.map(item => (
                <div key={item.id} className={styles.itemRow}>
                  <div className={styles.itemInputs}>
                    <input
                      type="text"
                      placeholder="Item name"
                      value={item.name}
                      onChange={e => updateItem(item.id, 'name', e.target.value)}
                      className={styles.itemName}
                    />
                    <div className={styles.inputWrap} style={{ width: '120px' }}>
                      <span className={styles.currency}>₹</span>
                      <input
                        type="number"
                        placeholder="0"
                        value={item.amount}
                        onChange={e => updateItem(item.id, 'amount', e.target.value)}
                        className={styles.amountInput}
                      />
                    </div>
                  </div>
                  <div className={styles.itemAssign}>
                    <span className={styles.assignLabel}>Who had this?</span>
                    <div className={styles.assignPeople}>
                      {people.map(p => (
                        <button
                          key={p.id}
                          className={`${styles.assignBtn} ${item.assignedTo.includes(p.id) ? styles.assignBtnActive : ''}`}
                          onClick={() => togglePersonOnItem(item.id, p.id)}
                        >
                          {p.name || '?'}
                        </button>
                      ))}
                    </div>
                  </div>
                  {items.length > 1 && (
                    <button className={styles.removeItemBtn} onClick={() => removeItem(item.id)}>Remove</button>
                  )}
                </div>
              ))}
            </div>
            <div className={styles.itemsTotal}>
              Items total: <span>₹{itemsTotal.toFixed(2)}</span>
            </div>
          </section>
        )}

        {/* Tip */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Tip (optional)</span>
          </div>
          <div className={styles.tipRow}>
            {[0, 10, 15, 20].map(pct => {
              const base = mode === 'equal' ? totalBill : itemsTotal
              const tipVal = ((base * pct) / 100).toFixed(2)
              return (
                <button
                  key={pct}
                  className={`${styles.tipBtn} ${tip === tipVal ? styles.tipBtnActive : ''}`}
                  onClick={() => setTip(pct === 0 ? '' : tipVal)}
                >
                  {pct === 0 ? 'No tip' : `${pct}%`}
                </button>
              )
            })}
          </div>
          <div className={styles.inputWrap} style={{ marginTop: '12px' }}>
            <span className={styles.currency}>₹</span>
            <input
              type="number"
              placeholder="Custom tip"
              value={tip}
              onChange={e => setTip(e.target.value)}
              className={styles.amountInput}
            />
          </div>
        </section>

        {/* Results */}
        <section className={styles.resultsSection}>
          <div className={styles.sectionLabel} style={{ marginBottom: '16px' }}>Each person pays</div>
          <div className={styles.results}>
            {results.map(r => (
              <div key={r.person.id} className={styles.resultRow}>
                <span className={styles.resultName}>{r.person.name || '?'}</span>
                <span className={styles.resultAmount}>₹{r.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className={styles.grandTotal}>
            Total: ₹{(mode === 'equal' ? grandTotal : itemsTotal + tipAmount).toFixed(2)}
            {tipAmount > 0 && <span className={styles.tipNote}> (incl. ₹{tipAmount.toFixed(2)} tip)</span>}
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <p className={styles.footerName}>Vani Krishna · vanikrishnamern@gmail.com</p>
          <a
            href="https://digitalheroesco.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.dhButton}
          >
            Built for Digital Heroes
          </a>
        </footer>

      </div>
    </main>
  )
}
