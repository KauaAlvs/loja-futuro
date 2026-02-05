"use client";

import { useCartStore } from "../../../app/store/cartStore";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
    Loader2, ArrowRight, ArrowLeft, CheckCircle, MapPin,
    ShoppingBag, Edit2, Lock, CreditCard, TicketPercent, X, AlertCircle, Home
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type Step = 1 | 2 | 3 | 4;

export default function CheckoutPage() {
    const router = useRouter();
    const { items, clearCart } = useCartStore();

    // --- ESTADOS GERAIS ---
    const [step, setStep] = useState<Step>(1);
    const [loading, setLoading] = useState(false);

    // --- ESTADOS DE AUTH (Step 2) ---
    const [email, setEmail] = useState("");
    const [confirmEmail, setConfirmEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLogin, setIsLogin] = useState(true);
    const [isRecovering, setIsRecovering] = useState(false);
    const [user, setUser] = useState<any>(null);

    // --- ESTADOS DE ENDEREÇO (Step 3) ---
    const [savedAddress, setSavedAddress] = useState<any>(null);
    const [isEditingAddress, setIsEditingAddress] = useState(false);

    const [addressForm, setAddressForm] = useState({
        full_name: "",
        zip_code: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: ""
    });

    // --- ESTADOS DE FRETE & CUPOM ---
    const [loadingShipping, setLoadingShipping] = useState(false);
    const [shippingOptions, setShippingOptions] = useState<any[]>([]);
    const [selectedShipping, setSelectedShipping] = useState<any>(null);

    // Estados do Cupom
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState(""); // Novo estado para erro visual

    // --- CÁLCULOS ---
    const itemsTotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shippingCost = selectedShipping ? selectedShipping.price : 0;

    // Cálculo do Desconto
    const discountAmount = appliedCoupon
        ? appliedCoupon.discount_type === 'percentage'
            ? (itemsTotal * appliedCoupon.discount_value) / 100
            : appliedCoupon.discount_value
        : 0;

    // Garante que o total não seja negativo
    const finalTotal = Math.max(0, itemsTotal + shippingCost - discountAmount);

    // --- LÓGICA DE FRETE ---
    async function calculateShipping(cep: string) {
        if (cep.length < 8) return;
        setLoadingShipping(true);
        try {
            const cleanCep = cep.replace(/\D/g, "");
            const res = await fetch("/api/shipping", {
                method: "POST",
                body: JSON.stringify({ cep: cleanCep }),
            });
            const data = await res.json();
            if (data.options) setShippingOptions(data.options);
        } catch (error) {
            console.error("Erro frete:", error);
        } finally {
            setLoadingShipping(false);
        }
    }

    useEffect(() => {
        if (step === 3 && addressForm.zip_code && shippingOptions.length === 0) {
            calculateShipping(addressForm.zip_code);
        }
    }, [step, addressForm.zip_code]);

    // --- LÓGICA DE CUPOM (ATUALIZADA: SEM ALERTS) ---
    const handleApplyCoupon = async () => {
        if (!couponCode) return;

        setCouponLoading(true);
        setCouponError(""); // Limpa erros anteriores

        try {
            const { data, error } = await supabase
                .from('coupons')
                .select('*')
                .eq('code', couponCode.toUpperCase())
                .eq('is_active', true)
                .single();

            if (error || !data) {
                setCouponError("Cupom inválido ou não encontrado.");
                setAppliedCoupon(null);
                return;
            }

            // Validações
            if (data.expires_at && new Date(data.expires_at) < new Date()) {
                setCouponError("Este cupom expirou.");
                return;
            }
            if (data.usage_limit && data.usage_count >= data.usage_limit) {
                setCouponError("Este cupom atingiu o limite de uso.");
                return;
            }
            if (itemsTotal < data.min_purchase) {
                setCouponError(`Valor mínimo para este cupom: R$ ${data.min_purchase.toFixed(2)}`);
                return;
            }

            // Sucesso (Feedback visual apenas)
            setAppliedCoupon(data);
            setCouponError("");

        } catch (err) {
            setCouponError("Erro ao processar cupom.");
        } finally {
            setCouponLoading(false);
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode("");
        setCouponError("");
    };

    // --- HANDLERS ---

    const handleAddressChange = (e: any) => {
        const { name, value } = e.target;
        if (name === 'zip_code') {
            let v = value.replace(/\D/g, "").slice(0, 8);
            v = v.replace(/^(\d{5})(\d)/, "$1-$2");
            setAddressForm(prev => ({ ...prev, zip_code: v }));
            if (v.length === 9) calculateShipping(v);
        } else {
            setAddressForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleRecovery = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/update-password`,
            });
            if (error) throw error;
            alert("📧 Link de redefinição enviado! Verifique seu e-mail.");
            setIsRecovering(false);
            setIsLogin(true);
        } catch (error: any) {
            alert("Erro: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAuth = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!isLogin) {
                if (email !== confirmEmail) { alert("⚠️ Os e-mails não coincidem."); setLoading(false); return; }
                if (password !== confirmPassword) { alert("⚠️ As senhas não coincidem."); setLoading(false); return; }
            }

            let authUser;
            if (isLogin) {
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                authUser = data.user;
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email, password, options: { data: { full_name: "Cliente" } }
                });
                if (error) throw error;
                authUser = data.user;
            }

            if (authUser) {
                setUser(authUser);
                // Salva carrinho abandonado
                await supabase.from('abandoned_carts').upsert({
                    email: authUser.email,
                    items: items,
                    total_amount: itemsTotal,
                    status: 'abandoned'
                }, { onConflict: 'email' });

                // Busca endereço salvo
                const { data: customerData } = await supabase.from('customers').select('*').eq('email', email).single();
                if (customerData && customerData.zip) {
                    const formatted = {
                        full_name: customerData.name || "",
                        zip_code: customerData.zip || "",
                        street: customerData.address || "",
                        number: customerData.number || "",
                        complement: customerData.complement || "",
                        neighborhood: customerData.neighborhood || "",
                        city: customerData.city || "",
                        state: customerData.state || ""
                    };
                    setSavedAddress(formatted);
                    setAddressForm(formatted);
                    setIsEditingAddress(false);
                } else {
                    setIsEditingAddress(true);
                }
                setStep(3);
            }
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAddress = async (e: any) => {
        e.preventDefault();
        if (!selectedShipping) return alert("Selecione o frete.");
        setLoading(true);
        try {
            if (user) {
                await supabase.from('customers').upsert({
                    email: user.email,
                    user_id: user.id,
                    name: addressForm.full_name,
                    address: addressForm.street,
                    zip: addressForm.zip_code,
                    number: addressForm.number,
                    complement: addressForm.complement,
                    neighborhood: addressForm.neighborhood,
                    city: addressForm.city,
                    state: addressForm.state
                }, { onConflict: 'email' });
            }
            setStep(4);
        } catch (error: any) {
            alert("Erro ao salvar endereço: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFinishOrder = async () => {
        setLoading(true);
        const fullAddress = `${addressForm.street}, ${addressForm.number} - ${addressForm.neighborhood}, ${addressForm.city}/${addressForm.state} - CEP: ${addressForm.zip_code}`;

        try {
            // 1. Salvar Pedido
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert([{
                    customer_email: email,
                    customer_name: addressForm.full_name,
                    customer_address: fullAddress,
                    total_amount: finalTotal, // Usa o total COM desconto
                    subtotal: itemsTotal,
                    discount: discountAmount, // Salva o desconto aplicado
                    coupon_code: appliedCoupon ? appliedCoupon.code : null, // Salva o código
                    status: 'pending',
                    shipping_method: selectedShipping.name,
                    shipping_cost: selectedShipping.price
                }])
                .select().single();

            if (orderError) throw orderError;

            // 2. Salvar Itens
            const orderItems = items.map((item) => ({
                order_id: order.id,
                product_id: item.id,
                product_name: item.name,
                quantity: item.quantity,
                price: item.price,
                variant_id: item.variantId || null,
            }));
            await supabase.from('order_items').insert(orderItems);

            // 3. Atualizar Estoque
            for (const item of items) {
                // Atualiza variante
                if (item.variantId) {
                    const { data: v } = await supabase.from('product_variants').select('stock').eq('id', item.variantId).single();
                    if (v) await supabase.from('product_variants').update({ stock: Math.max(0, v.stock - item.quantity) }).eq('id', item.variantId);
                }

                // Se for moda, atualiza product_stock (SKU)
                if (item.size && item.variantId) {
                    const { data: s } = await supabase.from('product_stock').select('quantity, id').eq('variant_id', item.variantId).eq('size', item.size).single();
                    if (s) await supabase.from('product_stock').update({ quantity: Math.max(0, s.quantity - item.quantity) }).eq('id', s.id);
                }
            }

            // 4. Incrementar uso do cupom
            if (appliedCoupon) {
                await supabase.from('coupons').update({ usage_count: appliedCoupon.usage_count + 1 }).eq('id', appliedCoupon.id);
            }

            // 5. Limpar Carrinho Abandonado
            await supabase.from('abandoned_carts').update({ status: 'recovered' }).eq('email', email);

            // 6. Integração Mercado Pago
            const mpResponse = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items,
                    orderId: order.id,
                    customerEmail: email,
                    shippingCost: selectedShipping.price,
                    shippingName: selectedShipping.name,
                    discountAmount: discountAmount // Envia desconto para API do MP
                }),
            });

            const mpData = await mpResponse.json();
            if (mpData.init_point) {
                window.location.href = mpData.init_point;
            } else {
                throw new Error("Falha ao gerar link de pagamento.");
            }

        } catch (error: any) {
            alert("Erro: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) return <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">Carrinho vazio. <Link href="/" className="text-cyan-400 mt-4 underline">Voltar</Link></div>;

    return (
        <main className="min-h-screen bg-black text-white pt-28 pb-10 px-4 flex flex-col items-center">

            {/* BARRA DE PROGRESSO */}
            <div className="w-full max-w-2xl mb-12">
                <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase mb-2">
                    <span className={step >= 1 ? "text-cyan-400" : ""}>Resumo</span>
                    <span className={step >= 2 ? "text-cyan-400" : ""}>Identificação</span>
                    <span className={step >= 3 ? "text-cyan-400" : ""}>Entrega</span>
                    <span className={step >= 4 ? "text-cyan-400" : ""}>Pagamento</span>
                </div>
                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }} />
                </div>
            </div>

            <div className="w-full max-w-xl">

                {/* STEP 1: RESUMO */}
                {step === 1 && (
                    <div className="animate-in fade-in duration-500">
                        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><ShoppingBag className="text-cyan-400" size={24} /> Resumo da Compra</h1>
                        <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 mb-6 space-y-4 max-h-[350px] overflow-y-auto custom-scrollbar">
                            {items.map(item => (
                                <div key={`${item.id}-${item.variantId}`} className="flex gap-4 items-center">
                                    <div className="h-14 w-14 bg-gray-800 rounded-lg overflow-hidden relative border border-gray-700">
                                        {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="font-bold text-sm">{item.name}</p>
                                        <div className="text-[10px] text-gray-500 flex gap-2">
                                            {item.color && <span>Cor: {item.color}</span>}
                                            {item.size && <span>Tam: {item.size}</span>}
                                            <span>Qtd: {item.quantity}</span>
                                        </div>
                                    </div>
                                    <p className="font-bold text-cyan-400 text-sm">R$ {(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between items-center bg-gray-900 p-6 rounded-2xl border border-gray-800">
                            <div className="text-left"><p className="text-xs text-gray-400">Subtotal</p><p className="text-xl font-bold">R$ {itemsTotal.toFixed(2)}</p></div>
                            <button onClick={() => setStep(2)} className="bg-cyan-600 hover:bg-cyan-500 px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all">Continuar <ArrowRight size={18} /></button>
                        </div>
                    </div>
                )}

                {/* STEP 2: AUTH */}
                {step === 2 && (
                    <div className="animate-in fade-in duration-500">
                        <button onClick={() => setStep(1)} className="text-gray-500 flex items-center gap-2 mb-6 text-xs hover:text-white mx-auto md:mx-0"><ArrowLeft size={14} /> Voltar</button>
                        <h1 className="text-2xl font-bold mb-6 text-center">{isRecovering ? "Recuperar Senha" : (isLogin ? "Acesse sua conta" : "Crie sua conta")}</h1>
                        <div className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800">
                            {isRecovering ? (
                                <form onSubmit={handleRecovery} className="space-y-4">
                                    <div className="text-left space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">E-mail Cadastrado</label>
                                        <input type="email" placeholder="nome@exemplo.com" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black border border-gray-700 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none" />
                                    </div>
                                    <button disabled={loading} className="w-full bg-cyan-600 text-white font-bold py-3 rounded-xl hover:bg-cyan-500 transition-colors">Enviar Link de Recuperação</button>
                                    <button type="button" onClick={() => setIsRecovering(false)} className="w-full text-xs text-gray-500 underline mt-2">Voltar para o Login</button>
                                </form>
                            ) : (
                                <form onSubmit={handleAuth} className="space-y-4 text-left">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">E-mail</label>
                                        <input type="email" placeholder="E-mail" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black border border-gray-700 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none" />
                                    </div>
                                    {!isLogin && (
                                        <div className="space-y-1 animate-in fade-in">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Confirmar E-mail</label>
                                            <input type="email" placeholder="Repita o e-mail" required value={confirmEmail} onChange={e => setConfirmEmail(e.target.value)} className={`w-full bg-black border rounded-xl p-3 text-sm outline-none ${email && confirmEmail && email !== confirmEmail ? 'border-red-500' : 'border-gray-700 focus:border-cyan-500'}`} />
                                        </div>
                                    )}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Senha</label>
                                        <input type="password" placeholder="Sua senha" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black border border-gray-700 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none" />
                                        {isLogin && <button type="button" onClick={() => setIsRecovering(true)} className="text-[10px] text-gray-500 hover:text-cyan-400 block ml-auto mt-1 transition-colors">Esqueceu a senha?</button>}
                                    </div>
                                    {!isLogin && (
                                        <div className="space-y-1 animate-in fade-in">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Confirmar Senha</label>
                                            <input type="password" placeholder="Repita a senha" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={`w-full bg-black border rounded-xl p-3 text-sm outline-none ${password && confirmPassword && password !== confirmPassword ? 'border-red-500' : 'border-gray-700 focus:border-cyan-500'}`} />
                                        </div>
                                    )}
                                    <button disabled={loading} className="w-full bg-white text-black font-bold py-4 rounded-xl flex justify-center items-center gap-2 mt-6 transition-transform active:scale-95">
                                        {loading ? <Loader2 className="animate-spin" /> : (isLogin ? "Entrar Agora" : "Criar Minha Conta")}
                                    </button>
                                </form>
                            )}
                            {!isRecovering && <button onClick={() => { setIsLogin(!isLogin); setConfirmEmail(""); setConfirmPassword(""); }} className="w-full text-xs text-cyan-400 mt-6 underline">{isLogin ? "Não tem uma conta? Cadastre-se aqui" : "Já possui cadastro? Faça o login"}</button>}
                        </div>
                    </div>
                )}

                {/* STEP 3: ENTREGA */}
                {step === 3 && (
                    <div className="animate-in fade-in duration-500">
                        <h1 className="text-2xl font-bold mb-6 text-left">Dados de Entrega</h1>
                        <form onSubmit={handleSaveAddress} className="space-y-4 text-left">
                            {savedAddress && !isEditingAddress ? (
                                <div className="bg-gray-900 border border-cyan-500/30 p-6 rounded-2xl relative mb-6 shadow-lg shadow-cyan-900/10">
                                    <div className="absolute top-4 right-4"><CheckCircle className="text-green-500" size={24} /></div>
                                    <div className="flex items-center gap-2 text-cyan-400 mb-3"><Home size={18} /><h3 className="text-xs font-bold uppercase tracking-wider">Endereço de Entrega</h3></div>
                                    <div className="space-y-1">
                                        <p className="text-white font-bold text-lg">{savedAddress.full_name}</p>
                                        <p className="text-gray-300 text-sm leading-relaxed">{savedAddress.street}, {savedAddress.number} {savedAddress.complement && ` - ${savedAddress.complement}`}</p>
                                        <p className="text-gray-300 text-sm">{savedAddress.neighborhood}</p>
                                        <p className="text-gray-300 text-sm">{savedAddress.city} / {savedAddress.state}</p>
                                        <p className="text-gray-500 font-mono text-xs mt-2 flex items-center gap-1"><MapPin size={12} /> CEP: {savedAddress.zip_code}</p>
                                    </div>
                                    <button type="button" onClick={() => setIsEditingAddress(true)} className="text-cyan-400 text-xs font-bold mt-5 flex items-center gap-1 hover:text-cyan-300 transition-colors"><Edit2 size={14} /> Alterar local de entrega</button>
                                </div>
                            ) : (
                                <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 space-y-4">
                                    <input required placeholder="Nome do Destinatário" name="full_name" value={addressForm.full_name} onChange={handleAddressChange} className="w-full bg-black border border-gray-700 rounded-xl p-3 text-sm outline-none focus:border-cyan-500" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input required placeholder="CEP" name="zip_code" value={addressForm.zip_code} onChange={handleAddressChange} maxLength={9} className="bg-black border border-gray-700 rounded-xl p-3 text-sm outline-none focus:border-cyan-500" />
                                        <input required placeholder="Rua" name="street" value={addressForm.street} onChange={handleAddressChange} className="bg-black border border-gray-700 rounded-xl p-3 text-sm outline-none focus:border-cyan-500" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input required placeholder="Número" name="number" value={addressForm.number} onChange={handleAddressChange} className="bg-black border border-gray-700 rounded-xl p-3 text-sm outline-none focus:border-cyan-500" />
                                        <input placeholder="Complemento (Opcional)" name="complement" value={addressForm.complement} onChange={handleAddressChange} className="bg-black border border-gray-700 rounded-xl p-3 text-sm outline-none focus:border-cyan-500" />
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <input required placeholder="Bairro" name="neighborhood" value={addressForm.neighborhood} onChange={handleAddressChange} className="bg-black border border-gray-700 rounded-xl p-3 text-sm outline-none focus:border-cyan-500" />
                                        <input required placeholder="Cidade" name="city" value={addressForm.city} onChange={handleAddressChange} className="bg-black border border-gray-700 rounded-xl p-3 text-sm outline-none focus:border-cyan-500" />
                                        <input required placeholder="UF" name="state" value={addressForm.state} onChange={handleAddressChange} className="bg-black border border-gray-700 rounded-xl p-3 text-sm outline-none focus:border-cyan-500" />
                                    </div>
                                    {savedAddress && <button type="button" onClick={() => setIsEditingAddress(false)} className="text-xs text-red-400 underline">Cancelar alteração</button>}
                                </div>
                            )}

                            {(addressForm.zip_code.length >= 8) && (
                                <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 space-y-4">
                                    <h3 className="text-xs font-bold text-gray-400 flex items-center gap-2 uppercase">Opções de Frete</h3>
                                    {loadingShipping && <Loader2 className="animate-spin text-cyan-400 mx-auto" size={16} />}
                                    <div className="space-y-2">
                                        {shippingOptions.map((opt) => (
                                            <div key={opt.id} onClick={() => setSelectedShipping(opt)} className={`p-3 rounded-xl border cursor-pointer flex justify-between items-center transition-all ${selectedShipping?.id === opt.id ? 'border-cyan-500 bg-cyan-900/20' : 'border-gray-800 bg-black hover:border-gray-600'}`}>
                                                <div className="text-xs font-bold text-left"><p>{opt.name}</p><p className="text-[10px] text-gray-500">{opt.days} dias úteis</p></div>
                                                <div className="text-xs font-bold text-white">R$ {opt.price.toFixed(2)}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <button type="submit" disabled={!selectedShipping || loading} className={`w-full py-4 rounded-xl font-bold flex justify-center items-center gap-2 transition-all ${selectedShipping ? 'bg-cyan-600 hover:bg-cyan-500' : 'bg-gray-800 text-gray-500'}`}>
                                {loading ? <Loader2 className="animate-spin" /> : "Confirmar e Ir para Pagamento"}
                            </button>
                        </form>
                    </div>
                )}

                {/* STEP 4: PAGAMENTO COM CUPOM (NOVO VISUAL) */}
                {step === 4 && (
                    <div className="animate-in fade-in duration-500">
                        <button onClick={() => setStep(3)} className="text-gray-500 flex items-center gap-2 mb-6 text-xs mx-auto md:mx-0 hover:text-white"><ArrowLeft size={14} /> Voltar</button>

                        <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl mb-6 shadow-2xl">
                            <CreditCard className="mx-auto text-cyan-400 mb-4" size={48} />
                            <h2 className="text-2xl font-bold mb-2">Resumo Final</h2>
                            <p className="text-gray-400 text-sm">Você será redirecionado para o Checkout Seguro do Mercado Pago.</p>
                        </div>

                        {/* --- CAMPO DE CUPOM (VISUAL PREMIUM) --- */}
                        <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 mb-6 transition-all">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <TicketPercent className={`absolute left-3 top-3.5 transition-colors ${couponError ? "text-red-500" : "text-gray-500"}`} size={16} />
                                    <input
                                        type="text"
                                        placeholder="Cupom de desconto"
                                        value={couponCode}
                                        onChange={(e) => {
                                            setCouponCode(e.target.value.toUpperCase());
                                            setCouponError(""); // Limpa erro ao digitar
                                        }}
                                        disabled={!!appliedCoupon}
                                        onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                                        className={`w-full bg-black border rounded-xl py-3 pl-10 pr-3 text-sm outline-none uppercase font-bold tracking-wider transition-all ${couponError
                                                ? "border-red-500 text-red-500 focus:border-red-500"
                                                : "border-gray-700 focus:border-cyan-500 text-white"
                                            }`}
                                    />
                                </div>
                                {appliedCoupon ? (
                                    <button onClick={removeCoupon} className="bg-red-500/10 text-red-400 border border-red-500/30 px-4 rounded-xl hover:bg-red-500/20 transition-colors"><X size={18} /></button>
                                ) : (
                                    <button onClick={handleApplyCoupon} disabled={!couponCode || couponLoading} className="bg-white text-black font-bold px-6 rounded-xl text-xs hover:bg-gray-200 transition-colors disabled:opacity-50">
                                        {couponLoading ? <Loader2 className="animate-spin" /> : "APLICAR"}
                                    </button>
                                )}
                            </div>

                            {/* FEEDBACK DE SUCESSO (CAIXA VERDE) */}
                            {appliedCoupon && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300 mt-3 bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center gap-2">
                                    <CheckCircle size={14} className="text-green-400" />
                                    <p className="text-green-400 text-xs font-bold">
                                        Cupom {appliedCoupon.code} aplicado com sucesso!
                                    </p>
                                </div>
                            )}

                            {/* FEEDBACK DE ERRO (TEXTO VERMELHO) */}
                            {couponError && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300 mt-3 flex items-center gap-2 text-red-400">
                                    <AlertCircle size={14} />
                                    <p className="text-xs font-bold">{couponError}</p>
                                </div>
                            )}
                        </div>

                        {/* --- RESUMO DE VALORES --- */}
                        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 mb-6 space-y-2 text-sm text-left">
                            <div className="flex justify-between"><span>Produtos</span><span>R$ {itemsTotal.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>Frete ({selectedShipping?.name})</span><span>R$ {shippingCost.toFixed(2)}</span></div>

                            {appliedCoupon && (
                                <div className="flex justify-between text-green-400 font-bold">
                                    <span>Desconto ({appliedCoupon.code})</span>
                                    <span>- R$ {discountAmount.toFixed(2)}</span>
                                </div>
                            )}

                            <hr className="border-gray-800 my-2" />
                            <div className="flex justify-between text-xl font-bold text-green-400"><span>Total</span><span>R$ {finalTotal.toFixed(2)}</span></div>
                        </div>

                        <button onClick={handleFinishOrder} disabled={loading} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-green-900/20">
                            {loading ? <Loader2 className="animate-spin" /> : <Lock size={18} />}
                            {loading ? "Preparando Pagamento..." : "PAGAR AGORA NO MERCADO PAGO"}
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}