import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getUserInfo, logoutUser } from "../services/movieService";

const palette = {
    chipBg: "#111827",      
    chipBorder: "#374151",  
    surface: "#0B1220",     
    panel: "#111827",       
    border: "#374151",      
    text: "#E5E7EB",        
    subtext: "#9CA3AF",     
    hover: "#1F2937",       
    accent: "#8B5CF6",     
};

const styles = {
    nav: {
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        padding: "12px 20px",
        borderBottom: `1px solid ${palette.border}`,
        background: palette.surface,
    },
    chipBtn: (open) => ({
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: palette.chipBg,
        color: palette.text,
        padding: "6px 10px",
        borderRadius: 9999,
        border: `1px solid ${open ? palette.accent : palette.chipBorder}`,
        cursor: "pointer",
        outline: "none",
        transition: "border-color .15s ease, transform .06s ease",
    }),
    avatar: {
        width: 28,
        height: 28,
        borderRadius: "50%",
        background:
            "linear-gradient(135deg, rgba(139,92,246,.25) 0%, rgba(59,130,246,.25) 100%)",
        color: palette.text,
        display: "grid",
        placeItems: "center",
        fontWeight: 700,
        fontSize: 13,
        border: `1px solid ${palette.border}`,
    },
    chevron: (open) => ({
        width: 16,
        height: 16,
        transform: `rotate(${open ? 180 : 0}deg)`,
        transition: "transform .15s ease",
        opacity: 0.85,
    }),
    menu: {
        position: "absolute",
        right: 0,
        top: "calc(100% + 10px)",
        width: 260,
        background: palette.panel,
        color: palette.text,
        border: `1px solid ${palette.border}`,
        borderRadius: 12,
        boxShadow: "0 12px 40px rgba(0,0,0,.45)",
        padding: 8,
        zIndex: 50,
    },
    header: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 10px 8px",
    },
    headerAvatar: {
        width: 40,
        height: 40,
        borderRadius: "50%",
        background:
            "linear-gradient(135deg, rgba(139,92,246,.35) 0%, rgba(59,130,246,.35) 100%)",
        display: "grid",
        placeItems: "center",
        fontWeight: 800,
        border: `1px solid ${palette.border}`,
    },
    name: { fontWeight: 700, lineHeight: 1.1 },
    sub: { color: palette.subtext, fontSize: 12, marginTop: 2 },
    divider: {
        height: 1,
        background: "rgba(148,163,184,.25)",
        margin: "8px 0",
    },
    item: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 8,
        textDecoration: "none",
        color: palette.text,
        cursor: "pointer",
    },
    itemHover: { background: palette.hover },
    icon: { width: 18, height: 18, opacity: 0.9 },
};

function getInitials(name = "") {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "?";
    const first = parts[0][0] || "";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase();
}

const UserIcon = (props) => (
    <svg viewBox="0 0 24 24" style={{ ...styles.icon, ...props.style }} fill="currentColor">
        <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-5 0-9 2.5-9 5.5A1.5 1.5 0 0 0 4.5 21h15A1.5 1.5 0 0 0 21 19.5C21 16.5 17 14 12 14Z" />
    </svg>
);

const PowerIcon = (props) => (
    <svg viewBox="0 0 24 24" style={{ ...styles.icon, ...props.style }} fill="currentColor">
        <path d="M12 2a1 1 0 0 1 1 1v8a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1Zm5.657 3.343a1 1 0 0 1 1.414 1.414A9 9 0 1 1 4.93 6.757a1 1 0 1 1 1.414-1.414 7 7 0 1 0 9.314 0Z" />
    </svg>
);

const ChevronIcon = (props) => (
    <svg viewBox="0 0 20 20" style={{ ...styles.chevron(props.open) }} fill="currentColor">
        <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.17l3.71-2.94a.75.75 0 1 1 .94 1.16l-4.24 3.36a.75.75 0 0 1-.94 0L5.21 8.39a.75.75 0 0 1 .02-1.18Z" />
    </svg>
);

export default function Navbar() {
    const [user, setUser] = useState(null);          
    const [open, setOpen] = useState(false);
    const btnRef = useRef(null);
    const panelRef = useRef(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const info = await getUserInfo();           
                if (mounted) setUser(info);
            } catch {
                if (mounted) setUser(null);
            }
        })();
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        const onDocClick = (e) => {
            if (!open) return;
            if (
                panelRef.current && !panelRef.current.contains(e.target) &&
                btnRef.current && !btnRef.current.contains(e.target)
            ) setOpen(false);
        };
        const onEsc = (e) => e.key === "Escape" && setOpen(false);
        document.addEventListener("mousedown", onDocClick);
        document.addEventListener("keydown", onEsc);
        return () => {
            document.removeEventListener("mousedown", onDocClick);
            document.removeEventListener("keydown", onEsc);
        };
    }, [open]);

    const displayName = user?.fullName || user?.username || "Account";
    const initials = useMemo(() => getInitials(displayName), [displayName]);

    const handleLogout = async () => {
        try {
            await logoutUser();
        } finally {
            setUser(null);
            setOpen(false);
        }
    };

    return (
        <nav style={styles.nav}>
            {user ? (
                <div style={{ position: "relative" }}>
                    <button
                        ref={btnRef}
                        style={styles.chipBtn(open)}
                        onClick={() => setOpen((v) => !v)}
                        aria-expanded={open}
                        aria-haspopup="menu"
                        title={displayName}
                    >
                        <span style={styles.avatar}>{initials}</span>
                        <span style={{ fontWeight: 600 }}>{displayName}</span>
                        <ChevronIcon open={open} />
                    </button>

                    {open && (
                        <div ref={panelRef} style={styles.menu} role="menu">
                            <div style={styles.header}>
                                <div style={styles.headerAvatar}>{initials}</div>
                                <div>
                                    <div style={styles.name}>{displayName}</div>
                                    {user?.username && <div style={styles.sub}>@{user.username}</div>}
                                </div>
                            </div>

                            <div style={styles.divider} />

                            <Link
                                to="/search"
                                style={styles.item}
                                onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.itemHover)}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                role="menuitem"
                            >
                                <UserIcon />
                                <span>Your Search</span>
                            </Link>

                            <button
                                onClick={handleLogout}
                                style={{ ...styles.item, width: "100%", background: "transparent", border: "none", textAlign: "left" }}
                                onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.itemHover)}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                role="menuitem"
                            >
                                <PowerIcon />
                                <span>Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <Link to="/login">
                    <button style={styles.chipBtn(false)}>Sign In</button>
                </Link>
            )}
        </nav>
    );
}
