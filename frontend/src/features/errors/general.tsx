export default function ServerErrorPage() {
	return (
		<div className="container mx-auto p-6 text-center">
			<h1 className="text-3xl font-bold mb-4">500 — Error del servidor</h1>
			<p className="mb-6">Ocurrió un error interno. Intenta nuevamente más tarde.</p>
			<a href="/" className="btn btn-primary">Volver al inicio</a>
		</div>
	)
}
