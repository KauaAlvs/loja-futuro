import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Column,
  Row,
} from "@react-email/components";
import * as React from "react";

interface Product {
  name: string;
  price: number;
  image_url?: string;
  quantity: number;
}

interface AbandonedCartEmailProps {
  userFirstname: string;
  items: Product[];
}

export const AbandonedCartEmail = ({
  userFirstname = "Cliente",
  items = [], // Recebe a lista de produtos
}: AbandonedCartEmailProps) => {
  
  // Calcula o total apenas para exibir no e-mail
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <Html>
      <Head />
      <Preview>Você esqueceu algo incrível no carrinho... 👀</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* HEADER */}
          <Section style={header}>
            <Text style={logoText}>LOJA<span style={{color: '#22d3ee'}}>FUTURO</span>.</Text>
          </Section>

          {/* CAIXA PRINCIPAL */}
          <Section style={contentBox}>
            <Heading style={h1}>Olá, {userFirstname}!</Heading>
            <Text style={text}>
              Percebemos que você não finalizou sua compra. As peças que você escolheu são muito disputadas, e não conseguimos reservá-las por muito tempo.
            </Text>
            
            <Text style={textHighlight}>
              Aqui está o que te espera:
            </Text>

            <Hr style={hr} />

            {/* LISTA DE PRODUTOS DINÂMICA */}
            {items.map((item, index) => (
              <Section key={index} style={itemRow}>
                <Row>
                  <Column style={{ width: "80px" }}>
                    <Img
                      src={item.image_url || "https://via.placeholder.com/150"}
                      alt={item.name}
                      width="70"
                      height="70"
                      style={itemImage}
                    />
                  </Column>
                  <Column>
                    <Text style={itemName}>{item.name}</Text>
                    <Text style={itemQuantity}>Qtd: {item.quantity}</Text>
                  </Column>
                  <Column style={{ textAlign: "right" }}>
                    <Text style={itemPrice}>
                      R$ {(item.price * item.quantity).toFixed(2)}
                    </Text>
                  </Column>
                </Row>
              </Section>
            ))}

            <Hr style={hr} />

            <Section style={totalSection}>
               <Row>
                  <Column>
                     <Text style={totalLabel}>TOTAL</Text>
                  </Column>
                  <Column style={{ textAlign: "right" }}>
                     <Text style={totalPrice}>R$ {total.toFixed(2)}</Text>
                  </Column>
               </Row>
            </Section>

            {/* BOTÃO DE AÇÃO */}
            <Section style={btnContainer}>
              <Button style={button} href="https://loja-futuro.vercel.app/checkout">
                Retomar Minha Compra
              </Button>
            </Section>

            <Text style={textSmall}>
              Se tiver dúvidas ou precisar de ajuda para finalizar, responda este e-mail.
            </Text>
          </Section>
          
          {/* RODAPÉ */}
          <Section style={footer}>
            <Text style={footerText}>
              © 2026 Loja Futuro Inc. • Não perca seu estilo.
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
};

export default AbandonedCartEmail;

// --- ESTILOS PREMIUM (DARK MODE) ---

const main = {
  backgroundColor: "#000000",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  padding: "40px 0",
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
  fontWeight: "900",
  letterSpacing: "-1px",
  fontStyle: "italic",
  margin: "0",
  textTransform: "uppercase" as const,
};

const contentBox = {
  backgroundColor: "#0a0a0a",
  border: "1px solid #262626",
  borderRadius: "16px",
  padding: "40px",
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
  color: "#a3a3a3",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "0 0 20px",
  textAlign: "left" as const,
};

const textHighlight = {
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0 0 10px",
};

const hr = {
  borderColor: "#262626",
  margin: "20px 0",
};

// Estilos dos Itens
const itemRow = {
  marginBottom: "16px",
};

const itemImage = {
  borderRadius: "8px",
  objectFit: "cover" as const,
};

const itemName = {
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "bold",
  margin: "0 0 4px",
};

const itemQuantity = {
  color: "#525252",
  fontSize: "12px",
  margin: "0",
};

const itemPrice = {
  color: "#22d3ee", // Cyan para o preço
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0",
};

// Total
const totalSection = {
    marginBottom: "20px",
};

const totalLabel = {
    color: "#a3a3a3",
    fontSize: "14px",
    fontWeight: "bold",
};

const totalPrice = {
    color: "#ffffff",
    fontSize: "20px",
    fontWeight: "900",
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
  backgroundColor: "#22d3ee",
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
  width: "100%", // Botão full width no mobile
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