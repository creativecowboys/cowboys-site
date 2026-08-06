// No metadata here on purpose: services/page.tsx sits in the same segment and
// its own export wins, so anything declared here is dead config that just
// invites the two copies to drift apart. Edit the page instead.

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
    return children;
}
