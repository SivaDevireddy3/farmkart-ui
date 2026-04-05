import { useState, useEffect } from 'react'
import { sellerAPI } from '../api'
import { useSearchParams } from 'react-router-dom'

export default function Contact() {
    const [sellers, setSellers] = useState([])
    const [selected, setSelected] = useState(null)
    const [searchParams] = useSearchParams()

    useEffect(() => {
        sellerAPI.getActive().then(r => {
            setSellers(r.data)
            const sellerId = searchParams.get('seller')
            if (sellerId) {
                sellerAPI.getPublic(sellerId).then(sr => setSelected(sr.data))
            }
        })
    }, [])

    return (
        <div className="page" style={{ maxWidth: 640 }}>
            <h1 className="section-title">Contact a Store 🏪</h1>
            <p className="section-sub">Choose a store to get in touch</p>

            {sellers.length > 1 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                    {sellers.map(s => (
                        <button key={s.id} onClick={() => sellerAPI.getPublic(s.id).then(r => setSelected(r.data))}
                            className={`btn ${selected?.storeName === s.storeName ? 'btn-primary' : 'btn-outline'}`}>
                            {s.storeName}
                        </button>
                    ))}
                </div>
            )}

            {selected ? (
                <div className="card" style={{ padding: 24 }}>
                    <h2 style={{ fontFamily: 'Playfair Display', fontSize: 22, marginBottom: 4 }}>{selected.storeName}</h2>
                    {selected.storeDescription && <p style={{ color: '#78716c', marginBottom: 16, lineHeight: 1.6 }}>{selected.storeDescription}</p>}

                    <div style={{ display: 'grid', gap: 12 }}>
                        {selected.ownerName && (
                            <div style={{ background: '#fafaf9', borderRadius: 10, padding: 14 }}>
                                <p style={{ fontSize: 12, color: '#78716c' }}>Owner</p>
                                <p style={{ fontWeight: 600, fontSize: 16 }}>{selected.ownerName}</p>
                            </div>
                        )}
                        <div style={{ background: '#fafaf9', borderRadius: 10, padding: 14 }}>
                            <p style={{ fontSize: 12, color: '#78716c' }}>Phone</p>
                            <a href={`tel:+91${selected.mobile}`} style={{ fontWeight: 600, fontSize: 16 }}>
                                +91 {selected.mobile}
                            </a>
                        </div>
                        {selected.whatsapp && (
                            <div style={{ background: '#fafaf9', borderRadius: 10, padding: 14 }}>
                                <p style={{ fontSize: 12, color: '#78716c' }}>WhatsApp</p>
                                <a href={`https://wa.me/91${selected.whatsapp}`} target="_blank" rel="noreferrer"
                                    style={{ fontWeight: 600, fontSize: 16, color: '#10b981' }}>
                                    Chat on WhatsApp ↗
                                </a>
                            </div>
                        )}
                        {selected.email && (
                            <div style={{ background: '#fafaf9', borderRadius: 10, padding: 14 }}>
                                <p style={{ fontSize: 12, color: '#78716c' }}>Email</p>
                                <a href={`mailto:${selected.email}`} style={{ fontWeight: 600, fontSize: 16 }}>{selected.email}</a>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: 60, color: '#78716c' }}>
                    <div style={{ fontSize: 60 }}>👆</div>
                    <p style={{ marginTop: 12 }}>Select a store above to see contact details</p>
                </div>
            )}
        </div>
    )
}