import { ImageResponse } from 'next/og'

// Dimensões do ícone
export const size = {
    width: 32,
    height: 32,
}
export const contentType = 'image/png'

// Geração do Ícone
export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: 'black',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '20%', // Bordas levemente arredondadas (estilo app)
                    border: '1px solid #333',
                }}
            >
                {/* SVG do Raio (Zap) idêntico ao Lucide Icons */}
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="#06b6d4" // Cor Cyan (preenchido)
                    stroke="#06b6d4" // Borda Cyan
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    {/* Desenho do Raio */}
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
            </div>
        ),
        { ...size }
    )
}