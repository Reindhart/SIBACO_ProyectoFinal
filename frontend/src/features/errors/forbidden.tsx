export default function ProhibitedPage() {
	return (
		<div className="container mx-auto p-6 text-center">
			<h1 className="text-3xl font-bold mb-4">403 — Acceso prohibido</h1>
			<p className="mb-6">No tienes permisos para ver esta página.</p>
			<a href="/" className="btn btn-primary">Volver al inicio</a>
		</div>
	)
}
