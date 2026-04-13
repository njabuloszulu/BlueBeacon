import { useState } from 'react';

const CELLS = [
  { id: 'A1', status: 'occ', detainee: 'Peter van Niekerk', charge: 'Robbery', since: '10 Apr', bail: 'Denied' },
  { id: 'A2', status: 'emp', detainee: null },
  { id: 'A3', status: 'wrn', detainee: 'Marcus B.', charge: 'Assault', since: '13 Apr', bail: 'Pending', note: 'Medical attention required' },
  { id: 'B1', status: 'emp', detainee: null },
  { id: 'B2', status: 'emp', detainee: null },
  { id: 'B3', status: 'occ', detainee: 'John van der Berg', charge: 'Armed Robbery', since: '13 Apr', bail: 'Pending' },
  { id: 'B4', status: 'occ', detainee: 'Unnamed F.', charge: 'DUI', since: '13 Apr', bail: 'Pending' },
  { id: 'C1', status: 'emp', detainee: null },
  { id: 'C2', status: 'emp', detainee: null },
  { id: 'C3', status: 'occ', detainee: 'Lerato M.', charge: 'Fraud', since: '12 Apr', bail: 'Granted' },
  { id: 'D1', status: 'emp', detainee: null },
  { id: 'D2', status: 'emp', detainee: null },
];

export default function CellBoard() {
  const [selected, setSelected] = useState(null);

  const occupied = CELLS.filter(c => c.status === 'occ' || c.status === 'wrn').length;
  const total = CELLS.length;

  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div className="page-tag">Officer · Cell Board</div>
        <div className="page-title">Cell Board</div>
        <div className="page-desc">Real-time occupancy overview for Cape Town Central holding cells.</div>
      </div>

      <div className="g4" style={{ marginBottom: 16 }}>
        <div className="stat-card accent-rd"><div className="stat-label">Occupied</div><div className="stat-value">{occupied}</div></div>
        <div className="stat-card accent-gn"><div className="stat-label">Available</div><div className="stat-value">{total - occupied}</div></div>
        <div className="stat-card accent-am"><div className="stat-label">Total Cells</div><div className="stat-value">{total}</div></div>
        <div className="stat-card accent-pu"><div className="stat-label">Flagged</div><div className="stat-value">1</div><div className="stat-delta delta-dn">Medical attention</div></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
        <div>
          <div className="section-label">Cell Grid</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {CELLS.map(cell => (
              <div key={cell.id} onClick={() => setSelected(cell)} style={{
                padding: 14,
                borderRadius: 8,
                border: selected?.id === cell.id ? '2px solid var(--blb)' : `1px solid ${cell.status === 'occ' ? 'rgba(239,68,68,.22)' : cell.status === 'wrn' ? 'rgba(245,158,11,.22)' : 'rgba(16,185,129,.18)'}`,
                background: cell.status === 'occ' ? 'rgba(239,68,68,.07)' : cell.status === 'wrn' ? 'rgba(245,158,11,.07)' : 'rgba(16,185,129,.05)',
                cursor: 'pointer',
                textAlign: 'center',
              }}>
                <div className="mono" style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{cell.id}</div>
                <div style={{ fontSize: 10, color: cell.status === 'occ' ? 'var(--rdb)' : cell.status === 'wrn' ? 'var(--amb)' : 'var(--gnb)' }}>
                  {cell.status === 'occ' ? 'Occupied' : cell.status === 'wrn' ? '⚠ Flagged' : 'Empty'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          {selected ? (
            <div className="card">
              <div className="card-header">
                <span className="card-title">Cell {selected.id}</span>
                <span className={`b ${selected.status === 'occ' ? 'b-cri' : selected.status === 'wrn' ? 'b-me' : 'b-act'}`}>
                  {selected.status === 'occ' ? 'Occupied' : selected.status === 'wrn' ? 'Flagged' : 'Empty'}
                </span>
              </div>
              <div className="card-body" style={{ fontSize: 12 }}>
                {selected.detainee ? (
                  <>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>{selected.detainee}</div>
                    {[['Charge', selected.charge], ['Detained Since', selected.since], ['Bail Status', selected.bail]].map(([l, v]) => (
                      <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(36,48,74,.3)' }}>
                        <span style={{ color: 'var(--txd)' }}>{l}</span>
                        <span>{v}</span>
                      </div>
                    ))}
                    {selected.note && <div className="alert alert-wa" style={{ marginTop: 10 }}><div className="alert-icon">!</div>{selected.note}</div>}
                    <div className="dv" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <button className="btn btn-secondary">View Arrest Record</button>
                      <button className="btn btn-warning">Log Welfare Check</button>
                      <button className="btn btn-danger">Release Detainee</button>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--txd)' }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>🟢</div>
                    <div>Cell {selected.id} is empty and available</div>
                    <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>Assign Detainee</button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card"><div className="card-body" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--txd)' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🏢</div>
              <div style={{ fontSize: 12 }}>Select a cell to view occupant details</div>
            </div></div>
          )}
        </div>
      </div>
    </div>
  );
}
