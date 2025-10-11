import CartItemModel from "../Model/CartItemModel.js"
import CartModel from "../Model/CartModel.js"
import CartStoreModel from "../Model/CartStoreModel.js"
import OrderItemModel from "../Model/OrderItemModel.js"
import OrderModel from "../Model/OrderModel.js"
import OrderStoreModel from "../Model/OrderStoreModel.js"
import AuditLogModel from "../Model/AuditLogModel.js"

const OrderController = {
    createOrder: async (req, res) => {
        try {
            const { address } = req.body
            if (!address) return res.status(400).send({ message: "Missing address" })
            const user = req.user
            const cart = await CartModel.findOne({ user: user._id })
            const storeCart = await CartStoreModel.find({ cart_id: cart._id })

            const storeItems = await Promise.all(
                storeCart.map(async store => {
                    const items = await CartItemModel.find({ cartStoreId: store._id, is_chosen: true })
                    return { store, items }
                })
            )

            const order = await OrderModel.create({
                contact: address,
                total_amount: cart.subTotal,
                final_amount: cart.finalTotal,
                promotion: cart.promotion,
                shippingFee: cart.shippingFee
            })

            await Promise.all(
                storeItems.map(async (orders) => {
                    const storeOder = await OrderStoreModel.create({
                        order_id: order._id,
                        store: orders.store.store_id,
                        promotion: orders.store.promotion,
                        shippingFee: orders.store.shippingFee,
                        subTotal: orders.store.subTotal,
                        finalTotal: orders.store.finalTotal
                    })
                    await Promise.all(
                        orders.items.map(async (item)=>{
                        await OrderItemModel.create({
                            storeOrder: storeOder._id,
                            variant_id: item.variant_id,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            finalPrice: item.finalPrice
                        })
                    })
                    )                   
                })
            )
            await AuditLogModel.create({
                entity_type:"order",
                entity_id: order._id,
                action: "create",
                changes:[],
                performedBy: user._id
            })
            res.status(200).send({message: "Success"})
        } catch (error) {
            res.status(500).send({message: error.message})
        }
    },
    cancelOrder: async (req, res)=>{
        try {
            const user = req.user
            const {orderItemId} = req.body
            const orderItem = await OrderItemModel.findById(orderItemId)
            orderItem.status="CANCELLED"
            await orderItem.save()
            await AuditLogModel.create({
                action:"update",
                entity_id: orderItem._id,
                entity_type: "Order",
                changes:[{
                    field: "status",
                    oldValue: "Pending",
                    newValue: "Cancelled"
                }],
                performedBy: user._id
            })
            res.status(200).send({message: "Success"})
        } catch (error) {
            res.status(500).send({message: error.message})
        }
    }
}

export default OrderController