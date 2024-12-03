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
            alert('请留下您的名字');
            return;
        }
        
        if (currentOrder.length === 0) {
            alert('请选择至少一件商品');
            return;
        }

        // 显示加载状态
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="ri-loader-2-line"></i> 提交中...';

        const note = prompt('备注（可选）：') || '无';

        // 生成格式化的订单内容
        let orderContent = `
订单详情
————————————————
顾客姓名：${customerName}
下单时间：${new Date().toLocaleString('zh-CN')}
————————————————
商品明细：`;

        let subtotal = 0;
        currentOrder.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            orderContent += `\n· ${item.name} × ${item.quantity}  ¥${itemTotal}`;
        });

        if (selectedBean) {
            subtotal += selectedBean.price;
            orderContent += `\n· 咖啡豆：${selectedBean.name}  +¥${selectedBean.price}`;
        }

        orderContent += `\n————————————————
总计：¥${subtotal}
备注：${note}
————————————————`;

        // 显示订单确认
        if (confirm(orderContent + '\n\n确认提交订单吗？')) {
            // 使用 Email.js 发送邮件
            const result = await emailjs.send(
                "service_pmbbtxv",
                "template_hej6ag2",
                {
                    to_email: "443875039@qq.com",
                    customer_name: customerName,
                    order_details: orderContent
                }
            );
            
            alert('订单已提交成功！\n我们会尽快处理您的订单。');
            // 清空订单
            currentOrder = [];
            selectedBean = null;
            document.getElementById('customerName').value = '';
            updateOrderDisplay();
        }

    } catch (error) {
        alert('提交订单时发生错误：' + error.message);
        console.error('Error:', error);
    } finally {
        // 恢复按钮状态
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
    }
} 