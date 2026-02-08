import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
  userFirstname: string;
}

export const WelcomeEmail = ({ userFirstname }: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Bem-vindo ao futuro da moda! 🚀</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* LOGO HEADER */}
        <Section style={header}>
            <Text style={logoText}>LOJA<span style={{color: '#22d3ee'}}>FUTURO</span>.</Text>
        </Section>

        {/* CAIXA DE CONTEÚDO PRINCIPAL */}
        <Section style={contentBox}>
            <Heading style={h1}>Olá, {userFirstname}!</Heading>
            
            <Text style={text}>
              Seja muito bem-vindo. Agora você faz parte de um grupo seleto que entende que estilo e tecnologia andam juntos.
            </Text>
            
            <Text style={text}>
              Na <strong>Loja Futuro</strong>, cada peça é pensada para durar e impressionar. Separamos algumas coleções que acabaram de chegar e achamos que combinam com você.
            </Text>

            {/* BOTÃO DE AÇÃO */}
            <Section style={btnContainer}>
              <Button style={button} href="https://loja-futuro.vercel.app/">
                Explorar Coleção Nova
              </Button>
            </Section>

            <Text style={textSmall}>
              Se esse cadastro não foi feito por você, pode ignorar este e-mail.
            </Text>
        </Section>
        
        {/* RODAPÉ */}
        <Section style={footer}>
          <Text style={footerText}>
            © 2026 Loja Futuro Inc. • São Paulo, Brasil
          </Text>
          <Link href="https://loja-futuro.vercel.app/" style={footerLink}>
            Visite nosso site
          </Link>
        </Section>

      </Container>
    </Body>
  </Html>
);

export default WelcomeEmail;

// --- ESTILOS PREMIUM (DARK MODE) ---

const main = {
  backgroundColor: "#000000",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  padding: "40px 0", // Garante espaço nas laterais em telas pequenas
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "580px",
  width: "100%",
};

const header = {
  marginBottom: "30px",
  textAlign: "center" as const,
};

const logoText = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "900", // Extra bold
  letterSpacing: "-1px",
  fontStyle: "italic",
  margin: "0",
  textTransform: "uppercase" as const,
};

// A "Caixa" que segura o conteúdo com borda e padding
const contentBox = {
  backgroundColor: "#0a0a0a", // Um cinza quase preto, para destacar do fundo #000
  border: "1px solid #262626", // Borda sutil
  borderRadius: "16px",
  padding: "40px", // AQUI ESTÁ O PADDING QUE FALTAVA
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
};

const h1 = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0 0 20px",
  textAlign: "left" as const,
};

const text = {
  color: "#a3a3a3", // Cinza claro (não branco puro para não cansar a vista)
  fontSize: "16px",
  lineHeight: "26px",
  margin: "0 0 20px",
  textAlign: "left" as const,
};

const textSmall = {
  color: "#525252",
  fontSize: "12px",
  marginTop: "20px",
  textAlign: "left" as const,
};

const btnContainer = {
  textAlign: "center" as const,
  marginTop: "32px",
  marginBottom: "32px",
};

const button = {
  backgroundColor: "#22d3ee", // Cyan-400
  borderRadius: "10px",
  color: "#000000",
  fontWeight: "800",
  fontSize: "15px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "16px 36px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
};

const footer = {
  marginTop: "32px",
  textAlign: "center" as const,
};

const footerText = {
  color: "#525252",
  fontSize: "12px",
  margin: "0 0 8px",
};

const footerLink = {
  color: "#22d3ee",
  fontSize: "12px",
  textDecoration: "underline",
};