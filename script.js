// ==========================================
// 1. STATE (Our Data)
// ==========================================
// 💡 L State: Hon 3arrafna l "state" (mtl React) kermel ne7faz l data taba3 l order bma7al wa7ed (Single Source of Truth), w nseer n8ayyer fiya badal ma ne2ra mn l HTML.
const state = {
    products: [
        { id: 1, name: "Premium Wireless ANC Headphones", price: 299.00, quantity: 1, image: "🎧" },
        { id: 2, name: "Mechanical Gaming Keyboard", price: 129.50, quantity: 1, image: "⌨️" },
        { id: 3, name: "Ergonomic Optical Mouse", price: 79.99, quantity: 2, image: "🖱️" },
        { id: 4, name: "Pro Mouse Pad", price: 29.99, quantity: 2, image: "⬛" }
    ],
    deliveryMethod: "standard", 
    discountPercentage: 0,
    promoApplied: false,
    freeDeliveryThreshold: 600
};

// ==========================================
// 2. DOM ELEMENTS
// ==========================================
// Order Summary
const cartItemsContainer = document.getElementById("cart-items");
const itemCountEl = document.getElementById("item-count");
const subtotalEl = document.getElementById("summary-subtotal");
const deliveryEl = document.getElementById("summary-delivery");
const discountRow = document.getElementById("discount-row");
const discountEl = document.getElementById("summary-discount");
const totalEl = document.getElementById("summary-total");
const freeDeliveryMsg = document.getElementById("free-delivery-msg");
const labelStandardPrice = document.getElementById("label-standard-price");

// Modals
const successModal = document.getElementById("success-modal");
const successModalContent = document.getElementById("success-modal-content");
const successOrderNum = document.getElementById("success-order-num");
const successTotalAmount = document.getElementById("success-total-amount");
const closeSuccessBtn = document.getElementById("close-success-modal");
const printReceiptBtn = document.getElementById("print-receipt-btn");

const historyModal = document.getElementById("history-modal");
const historyModalContent = document.getElementById("history-modal-content");
const closeHistoryBtn = document.getElementById("close-history");
const viewHistoryBtn = document.getElementById("view-history-btn");
const historyList = document.getElementById("history-list");

// Form Elements
const sameAsDelivery = document.getElementById("sameAsDelivery");
const billingAddressContainer = document.getElementById("billingAddressContainer");
const billingAddress = document.getElementById("billingAddress");
const deliveryDate = document.getElementById("deliveryDate");

const promoInput = document.getElementById("promo-input");
const applyPromoBtn = document.getElementById("apply-promo");
const promoMessage = document.getElementById("promo-message");

const checkoutForm = document.getElementById("checkout-form");
const deliveryRadios = document.getElementsByName("delivery");
const paymentRadios = document.getElementsByName("payment");
const cardDetails = document.getElementById("card-details");

// ==========================================
// 3. CORE FUNCTIONS 
// ==========================================

// 💡 getSubtotal(): Hayde method bte7sob 7a2 l ightrad (bala delivery w discount). Sta3malna .reduce() kermel njma3 l (price * quantity) la kel product b tari2a ndife.
function getSubtotal() {
    return state.products.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// 💡 renderCart(): Hayde l method mas2oule tebne l cart HTML dynamically. Btshouf l state, w btekhlo2 l HTML la kel product ma3 l (+/-) buttons taba3o. Iza l cart fedye, btbayan message.
function renderCart() {
    cartItemsContainer.innerHTML = "";
    let totalItems = 0;

    if (state.products.length === 0) {
        cartItemsContainer.innerHTML = `<p class="text-gray-500 text-center text-sm py-6">Your cart is empty.</p>`;
        itemCountEl.textContent = 0;
        return;
    }

    state.products.forEach(product => {
        totalItems += product.quantity;
        const itemTotal = (product.price * product.quantity).toFixed(2);
        
        const itemHTML = `
            <div class="flex items-center gap-4 bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                <div class="w-12 h-12 bg-gray-800 rounded-md flex items-center justify-center text-2xl shadow-inner shrink-0">
                    ${product.image}
                </div>
                <div class="flex-1">
                    <h3 class="text-sm font-semibold text-gray-200 line-clamp-1">${product.name}</h3>
                    <div class="flex items-center gap-3 mt-2">
                        <button type="button" data-id="${product.id}" data-change="-1" class="qty-btn w-6 h-6 rounded-md bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white flex items-center justify-center transition-colors">
                            <svg class="w-3 h-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path></svg>
                        </button>
                        <span class="text-xs font-bold text-gray-300 w-4 text-center">${product.quantity}</span>
                        <button type="button" data-id="${product.id}" data-change="1" class="qty-btn w-6 h-6 rounded-md bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white flex items-center justify-center transition-colors">
                            <svg class="w-3 h-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                        </button>
                    </div>
                </div>
                <div class="text-right self-start mt-1">
                    <p class="font-bold text-gray-200">$${itemTotal}</p>
                </div>
            </div>
        `;
        cartItemsContainer.insertAdjacentHTML('beforeend', itemHTML);
    });

    itemCountEl.textContent = totalItems;
}

// 💡 updateQuantity(): Hayde bteshteghil lamma yekbos l user 3a (+) aw (-). Btfattesh 3al product bi .find(), btzid aw btna2es l quantity, w iza sar 0 btem7ih mn l array bi .filter(). Ba3den btarja3 bte3mel render.
function updateQuantity(id, change) {
    const product = state.products.find(p => p.id === id);
    if (!product) return;

    product.quantity += change;
    if (product.quantity <= 0) {
        state.products = state.products.filter(p => p.id !== id);
    }
    renderCart();
    updateTotals();
}

// 💡 updateTotals(): Hayde l "Mo5" (The Brain). Bte7sob l final total ba3d l 7asem wl delivery, w btf7as iza l user wosel lal "Free Delivery". Bte3mel update lal as3ar 3al shishe (DOM).
function updateTotals() {
    const subtotal = getSubtotal();
    
    const amountNeeded = state.freeDeliveryThreshold - subtotal;
    const isFreeEligible = amountNeeded <= 0;

    if (isFreeEligible) {
        freeDeliveryMsg.innerHTML = `🎉 You've unlocked <span class="text-green-400 font-bold">FREE Standard Delivery</span>!`;
        labelStandardPrice.innerHTML = `<span class="line-through text-gray-500 text-sm mr-1">$5.00</span> <span class="text-green-600">FREE</span>`;
    } else {
        freeDeliveryMsg.innerHTML = `Add <span class="text-white font-bold">$${amountNeeded.toFixed(2)}</span> more to get FREE Standard Delivery!`;
        labelStandardPrice.innerHTML = `<span class="text-indigo-600">$5.00</span>`;
    }

    let deliveryCost = 0;
    if (state.deliveryMethod === "standard") {
        deliveryCost = isFreeEligible ? 0 : 5; 
    } else if (state.deliveryMethod === "express") {
        deliveryCost = 10;
    }

    const discountAmount = subtotal * (state.discountPercentage / 100);
    const finalTotal = subtotal - discountAmount + deliveryCost;

    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    
    if (deliveryCost === 0) {
        deliveryEl.textContent = "FREE";
        deliveryEl.classList.add("text-green-400", "font-bold");
    } else {
        deliveryEl.textContent = `$${deliveryCost.toFixed(2)}`;
        deliveryEl.classList.remove("text-green-400", "font-bold");
    }
    
    if (state.discountPercentage > 0) {
        discountRow.classList.remove("hidden");
        discountEl.textContent = `-$${discountAmount.toFixed(2)}`;
    } else {
        discountRow.classList.add("hidden");
    }

    totalEl.textContent = `$${finalTotal.toFixed(2)}`;
}

// ==========================================
// 4. EVENT LISTENERS
// ==========================================

// 💡 Event Listeners lal Delivery w Payment: 3am nra2eb l radio buttons. Lamma yghayyer, mnghayyer l state taba3 l delivery aw mnzhar input l Credit Card.
deliveryRadios.forEach(radio => {
    radio.addEventListener("change", (e) => {
        state.deliveryMethod = e.target.value; 
        updateTotals(); 
    });
});

paymentRadios.forEach(radio => {
    radio.addEventListener("change", (e) => {
        if (e.target.value === "card") {
            cardDetails.classList.remove("hidden");
        } else {
            cardDetails.classList.add("hidden");
        }
    });
});

// 💡 Promo Code Logic: Btf7as l code iza "SAVE10" aw "SAVE20", btotla3 message, bt2fol l input, w bto5som mn l total. W fiha logic la te3mel "Cancel" lal promo iza kbas "Remove".
applyPromoBtn.addEventListener("click", () => {
    if (state.promoApplied) {
        state.discountPercentage = 0;
        state.promoApplied = false;
        
        promoInput.disabled = false;
        promoInput.value = "";
        
        applyPromoBtn.textContent = "Apply";
        applyPromoBtn.classList.remove("bg-red-600", "hover:bg-red-500");
        applyPromoBtn.classList.add("bg-gray-800", "hover:bg-gray-700");
        
        promoMessage.classList.add("hidden");
        updateTotals();
        return; 
    }

    const code = promoInput.value.trim().toUpperCase();

    if (code === "SAVE10") {
        state.discountPercentage = 10;
        state.promoApplied = true;
        promoInput.disabled = true;
        
        applyPromoBtn.textContent = "Remove";
        applyPromoBtn.classList.remove("bg-gray-800", "hover:bg-gray-700");
        applyPromoBtn.classList.add("bg-red-600", "hover:bg-red-500");
        
        showPromoMessage("Promo code applied successfully! (-10%)", "text-green-400");
        updateTotals(); 
        
    } else if (code === "SAVE20") {
        state.discountPercentage = 20;
        state.promoApplied = true;
        promoInput.disabled = true;
        
        applyPromoBtn.textContent = "Remove";
        applyPromoBtn.classList.remove("bg-gray-800", "hover:bg-gray-700");
        applyPromoBtn.classList.add("bg-red-600", "hover:bg-red-500");
        
        showPromoMessage("Promo code applied successfully! (-20%)", "text-green-400");
        updateTotals(); 
        
    } else if (code === "") {
        showPromoMessage("Please enter a promo code.", "text-red-400");
    } else {
        showPromoMessage("Invalid promo code.", "text-red-400");
    }
});

function showPromoMessage(msg, colorClass) {
    promoMessage.textContent = msg;
    promoMessage.className = `text-sm mb-6 font-medium ${colorClass}`; 
    promoMessage.classList.remove("hidden");
}

// 💡 Event Delegation lal Cart (+/-): Badal ma n7ot event 3a kel button, 7atayna we7ed 3al container l kbeer. Bshouf iza l kabsse 3al button fiyou class .qty-btn, byes7ab l ID w byeb3ata la updateQuantity.
cartItemsContainer.addEventListener("click", (e) => {
    const btn = e.target.closest(".qty-btn");
    if (!btn) return; 
    const id = parseInt(btn.dataset.id);
    const change = parseInt(btn.dataset.change);
    updateQuantity(id, change);
});

// 💡 Delivery Date Constraint: Mnamne3 l user yna2e tarikh bl made, l 'min' date houwe bukra.
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
deliveryDate.min = tomorrow.toISOString().split("T")[0]; 

// 💡 Billing Address Toggle: Iza shal l sa7 3an l checkbox, byezhar input l billing w bye3mlo required.
sameAsDelivery.addEventListener("change", (e) => {
    if (e.target.checked) {
        billingAddressContainer.classList.add("hidden");
        billingAddress.removeAttribute("required"); 
    } else {
        billingAddressContainer.classList.remove("hidden");
        billingAddress.setAttribute("required", "true"); 
    }
});

// 💡 Place Order (Form Submission): Hayde aham we7de. Btamne3 l refresh, bta3mel Custom Validation 3al 72oul (borders 7amra), bte5lo2 fake API delay, btsajjel l order bl localStorage, w byezhar l Success Modal.
checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault(); 

    let isValid = true;
    const requiredInputs = checkoutForm.querySelectorAll("input[required]");
    
    requiredInputs.forEach(input => {
        const errorMsg = input.nextElementSibling; 
        const val = input.value.trim(); // mnshel l spaces mnel awal wl ekhir
        let hasError = false;
        let errorMessageText = "";

        // 1. Check iza l input fade (Empty)
        if (!val) {
            hasError = true;
            errorMessageText = "This field is required";
        } 
        // 2. Check iza l esem (FullName) fiyou ar2am
        else if (input.id === "fullName" && /\d/.test(val)) {
            // /\d/ hiye Regex btfattesh 3a ay ra2em (Digit) mn 0 la 9. test() btraje3 true iza l2et ra2em.
            hasError = true;
            errorMessageText = "Name cannot contain numbers";
        } 
        // 3. Check iza l Email format sa7
        else if (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
            // Hayde l Regex btet2akkad enno fi text, ba3do @, ba3do text, ba3do no2ta (.), w ba3do text
            hasError = true;
            errorMessageText = "Please enter a valid email (e.g., name@domain.com)";
        }
        // 4. Check iza l Phone Number format (optional but good)
        else if (input.type === "tel" && !/^\+?[0-9\s\-\(\)]+$/.test(val)) {
            // Btasma7 bas b ar2am, spaces, signs (+, -, (, )) 
            hasError = true;
            errorMessageText = "Please enter a valid phone number";
        }

        // Tatbi2 l Alwan wl Messages 7asab l Natija
        if (hasError) {
            // Iza fi ghalat -> a3mel l border a7mar w bayyen l error msg
            input.classList.remove("border-gray-300", "focus:ring-indigo-500", "focus:border-indigo-500");
            input.classList.add("border-red-500", "focus:ring-red-500", "focus:border-red-500");
            
            errorMsg.textContent = errorMessageText; // 💡 NEW: 3am n7ot l text l moneseb lal ghalat dynamically
            errorMsg.classList.remove("hidden");
            isValid = false;
        } else {
            // Iza l input m3abba sa7 -> rajje3 l alwan l asasiye
            input.classList.remove("border-red-500", "focus:ring-red-500", "focus:border-red-500");
            input.classList.add("border-gray-300", "focus:ring-indigo-500", "focus:border-indigo-500");
            errorMsg.classList.add("hidden");
        }
    });

    if (!isValid) return;
    const orderNumber = "ORD-" + Math.floor(10000000 + Math.random() * 90000000);
    const btn = document.querySelector("button[type='submit']");
    const originalText = btn.innerHTML;
    
    btn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Processing Securely...
    `;
    btn.disabled = true;
    btn.classList.add("opacity-75", "cursor-wait");

    setTimeout(() => {
        const finalTotal = totalEl.textContent;
        const newOrder = {
            id: orderNumber,
            date: new Date().toLocaleDateString(),
            deliveryDate: deliveryDate.value,
            total: finalTotal,
            items: state.products.map(p => ({ name: p.name, qty: p.quantity }))
        };
        
        const history = JSON.parse(localStorage.getItem("luxe_orders")) || [];
        history.unshift(newOrder); 
        localStorage.setItem("luxe_orders", JSON.stringify(history));

        // Populate and show Modal
        successOrderNum.textContent = orderNumber;
        successTotalAmount.textContent = finalTotal;
        
        successModal.classList.remove("hidden");
        setTimeout(() => {
            successModal.classList.remove("opacity-0");
            successModalContent.classList.remove("scale-95");
        }, 10);
        
        // RESET MAIN BUTTON 
        btn.innerHTML = originalText;
        btn.disabled = false;
        btn.classList.remove("opacity-75", "cursor-wait");

        // RESET FORM AND STATE
        checkoutForm.reset();
        state.promoApplied = false;
        state.discountPercentage = 0;
        state.deliveryMethod = "standard"; 
        
        promoInput.disabled = false;
        promoInput.value = "";
        applyPromoBtn.textContent = "Apply";
        applyPromoBtn.classList.remove("bg-red-600", "hover:bg-red-500");
        applyPromoBtn.classList.add("bg-gray-800", "hover:bg-gray-700");
        promoMessage.classList.add("hidden");
        
        // Remove red borders if they exist
        requiredInputs.forEach(input => {
            input.classList.remove("border-red-500", "focus:ring-red-500", "focus:border-red-500");
            input.classList.add("border-gray-300", "focus:ring-indigo-500", "focus:border-indigo-500");
            input.nextElementSibling.classList.add("hidden");
        });

        updateTotals();
    }, 1500);
});

// 💡 loadOrderHistory(): Hayde btejib l orders l adime mn l localStorage (iza fi), w btakhla2on ka cards b a2lb l Modal taba3 l Order History.
function loadOrderHistory() {
    const history = JSON.parse(localStorage.getItem("luxe_orders")) || [];
    historyList.innerHTML = "";

    if (history.length === 0) {
        historyList.innerHTML = `<div class="text-center text-gray-500 py-10">No past orders found.</div>`;
        return;
    }

    history.forEach(order => {
        const itemsString = order.items.map(i => `${i.qty}x ${i.name}`).join("<br>");
        const card = `
            <div class="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div class="flex justify-between items-start mb-3 border-b border-gray-100 pb-3">
                    <div>
                        <span class="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">${order.id}</span>
                        <p class="text-sm text-gray-500 mt-2">Ordered on: ${order.date}</p>
                    </div>
                    <div class="text-right">
                        <p class="font-bold text-lg text-gray-900">${order.total}</p>
                        <p class="text-xs text-green-600 font-semibold mt-1">Delivery: ${order.deliveryDate}</p>
                    </div>
                </div>
                <p class="text-sm text-gray-600 leading-relaxed">${itemsString}</p>
            </div>
        `;
        historyList.insertAdjacentHTML("beforeend", card);
    });
}

// 💡 Modal Event Listeners: Haydol l kabsat la yeftaho w ysakro l History Modal wl Success Modal ma3 fade animation.
viewHistoryBtn.addEventListener("click", () => {
    loadOrderHistory(); 
    historyModal.classList.remove("hidden");
    setTimeout(() => {
        historyModal.classList.remove("opacity-0");
        historyModalContent.classList.remove("scale-95");
    }, 10);
});

closeHistoryBtn.addEventListener("click", () => {
    historyModal.classList.add("opacity-0");
    historyModalContent.classList.add("scale-95");
    setTimeout(() => {
        historyModal.classList.add("hidden");
    }, 300);
});

closeSuccessBtn.addEventListener("click", () => {
    successModal.classList.add("opacity-0");
    successModalContent.classList.add("scale-95");
    setTimeout(() => {
        successModal.classList.add("hidden");
    }, 300);
});

printReceiptBtn.addEventListener("click", () => {
    window.print(); 
});

// ==========================================
// 5. INITIALIZATION
// ==========================================
renderCart();
updateTotals();