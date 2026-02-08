import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
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
    <Preview>Bem-vindo à Loja do Futuro!</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* LOGO (Use uma URL pública da sua logo ou um placeholder por enquanto) */}
        <Section style={boxLogo}>
            <Text style={logoText}>LOJA<span style={{color: '#22d3ee'}}>FUTURO</span>.</Text>
        </Section>
        
        <Hr style={hr} />

        <Text style={paragraph}>
          Olá, {userFirstname}!
        </Text>
        <Text style={paragraph}>
          Estamos muito felizes em ter você conosco. A Loja do Futuro traz o que há de mais moderno em moda e tecnologia, selecionado especialmente para você.
        </Text>
        <Text style={paragraph}>
          Para começar, que tal dar uma olhada nas nossas novidades?
        </Text>

        <Section style={btnContainer}>
          <Button style={button} href="https://loja-futuro.vercel.app/">
            Ver Coleção Nova
          </Button>
        </Section>

        <Text style={paragraph}>
          Se tiver qualquer dúvida, é só responder a este e-mail.
        </Text>

        <Hr style={hr} />

        <Text style={footer}>
          © 2026 Loja do Futuro Inc.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default WelcomeEmail;

// --- ESTILOS CSS (Inline Styles são obrigatórios para e-mail) ---
const main = {
  backgroundColor: "#000000",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "560px",
};

const boxLogo = {
  padding: "20px",
  textAlign: "center" as const,
};

const logoText = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "bold",
  letterSpacing: "2px",
  margin: "0",
};

const hr = {
  borderColor: "#333",
  margin: "20px 0",
};

const paragraph = {
  color: "#cccccc",
  fontSize: "16px",
  lineHeight: "26px",
};

const btnContainer = {
  textAlign: "center" as const,
  marginTop: "30px",
  marginBottom: "30px",
};

const button = {
  backgroundColor: "#22d3ee", // Cyan-400
  borderRadius: "8px",
  color: "#000",
  fontWeight: "bold",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 24px",
};

const footer = {
  color: "#666666",
  fontSize: "12px",
  textAlign: "center" as const,
};