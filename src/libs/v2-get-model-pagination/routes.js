
const {
    Business, Cart, CartChangeLog,
    CartFloorItem, Color, Contact,
    Country, Employee, Floor, FloorBox,
    FloorCategory,
    FloorType, Industry, Installation,
    Installer, Invoice, Order, OrderStatusChangeLog,
    ShipToAddress, TeamMember, User, Video
} = require("../../models");

module.exports = [
    {
        path: "/businesses",
        model: Business
    },
    {
        path: "/carts",
        model: Cart
    },
    {
        path: "/cart_change_logs",
        model: CartChangeLog
    },
    {
        path: "/cart_floor_items",
        model: CartFloorItem
    },
    {
        path: "/colors",
        model: Color
    },
    {
        path: "/contacts",
        model: Contact
    },
    {
        path: "/countries",
        model: Country
    },
    {
        path: "/employees",
        model: Employee
    },
    {
        path: "/floors",
        model: Floor
    },
    {
        path: "/floor_boxes",
        model: FloorBox
    },
    {
        path: "/floor_categories",
        model: FloorCategory
    },
    {
        path: "/floor_types",
        model: FloorType
    },
    {
        path: "/industries",
        model: Industry
    },
    {
        path: "/installations",
        model: Installation
    },
    {
        path: "/installers",
        model: Installer
    },
    {
        path: "/invoices",
        model: Invoice
    },
    {
        path: "/orders",
        model: Order
    },
    {
        path: "/order_status_change_logs",
        model: OrderStatusChangeLog
    },
    {
        path: "/ship_to_addresses",
        model: ShipToAddress,
    },
    {
        path: "/team_members",
        model: TeamMember
    },
    {
        path: "/users",
        model: User
    },
    {
        path: "/videos",
        model: Video
    },
]