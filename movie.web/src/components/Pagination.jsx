import React from "react";

export default function Pagination({ page, total, pageSize = 10, onChange }) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    if (totalPages <= 1) return null;

    const go = (p) => onChange(Math.min(totalPages, Math.max(1, p)));

    // build compact range: 1 … (page-1,page,page+1) … last
    const range = [];
    const window = 1; // neighbors to show around current page
    const last = totalPages;

    range.push(1);
    let start = Math.max(2, page - window);
    let end = Math.min(last - 1, page + window);
    if (start > 2) range.push("…");
    for (let i = start; i <= end; i++) range.push(i);
    if (end < last - 1) range.push("…");
    if (last > 1) range.push(last);

    return (
        <div className="pager">
            <button className="pager-btn" onClick={() => go(page - 1)} disabled={page === 1}>
                Prev
            </button>
            {range.map((it, idx) =>
                it === "…" ? (
                    <span key={`e-${idx}`} className="pager-ellipsis">…</span>
                ) : (
                    <button
                        key={`p-${it}`}
                        className={`pager-page ${page === it ? "active" : ""}`}
                        onClick={() => go(it)}
                    >
                        {it}
                    </button>
                )
            )}
            <button className="pager-btn" onClick={() => go(page + 1)} disabled={page === totalPages}>
                Next
            </button>
        </div>
    );
}
