let currentOrder = [];
let selectedBean = null;

// 将使用相对路径，Vercel 会自动处理
const API_URL = '/api';

function addToOrder(name, price) {
    const existingItem = currentOrder.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        currentOrder.push({
            name: name,
            price: price,
            quantity: 1
        });
    }
    updateOrderDisplay();
}

function addBean(name, price) {
    selectedBean = { name, price };
    document.querySelectorAll('.beans button').forEach(btn => {
        btn.style.background = '#4a90e2';
    });
    event.target.style.background = '#4CAF50';
    updateOrderDisplay();
}

function updateOrderDisplay() {
    const orderList = document.getElementById('orderList');
    orderList.innerHTML = '';
    
    let total = 0;
    
    currentOrder.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const itemElement = document.createElement('div');
        itemElement.className = 'order-item';
        itemElement.innerHTML = `
            ${item.name} x${item.quantity} - ¥${itemTotal}
            <button onclick="removeItem('${item.name}')">-</button>
        `;
        orderList.appendChild(itemElement);
    });
    
    if (selectedBean) {
        total += selectedBean.price;
        const beanElement = document.createElement('div');
        beanElement.className = 'order-item';
        beanElement.innerHTML = `Coffee Bean: ${selectedBean.name} +¥${selectedBean.price}`;
        orderList.appendChild(beanElement);
    }
    
    document.getElementById('totalAmount').textContent = total;
}

function removeItem(name) {
    const itemIndex = currentOrder.findIndex(item => item.name === name);
    if (itemIndex > -1) {
        if (currentOrder[itemIndex].quantity > 1) {
            currentOrder[itemIndex].quantity -= 1;
        } else {
            currentOrder.splice(itemIndex, 1);
        }
        updateOrderDisplay();
    }
}

async function submitOrder() {
    const submitButton = document.getElementById('submitOrder');
    const originalText = submitButton.innerHTML;

    try {
        // 检查表单
        const customerName = document.getElementById('customerName').value;
        if (!customerName) {
            alert('Please leave your name');
            return;
        }
        
        if (currentOrder.length === 0) {
            alert('Please select at least one item');
            return;
        }

        // 显示加载状态
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="ri-loader-2-line"></i> Submitting...';

        const orderDetails = {
            customerName: customerName,
            items: currentOrder,
            bean: selectedBean,
            total: document.getElementById('totalAmount').textContent,
            note: prompt('Any special requests? (Optional)：') || 'None'
        };

        // 显示订单确认
        if (confirm(`您的订单：\n${JSON.stringify(orderDetails, null, 2)}\n\n确认提交订单吗？`)) {
            // 使用 Email.js 发送邮件
            const result = await emailjs.send(
                "service_pmbbtxv",     // 您的 Service ID
                "template_hej6ag2",    // 您的 Template ID
                {
                    to_email: "443875039@qq.com",
                    customer_name: orderDetails.customerName,
                    order_details: JSON.stringify(orderDetails, null, 2)
                }
            );
            
            alert('订单已提交成功！');
            // 清空订单
            currentOrder = [];
            selectedBean = null;
            document.getElementById('customerName').value = '';
            updateOrderDisplay();
        }

    } catch (error) {
        alert('Error submitting order: ' + error.message);
        console.error('Error:', error);
    } finally {
        // 恢复按钮状态
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
    }
} 