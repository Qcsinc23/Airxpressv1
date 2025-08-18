"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "react-use-cart";

export default function StoreSidebar() {
  const pathname = usePathname();
  const { totalItems } = useCart();

  const menuItems = [
    {
      title: "Woot Deals",
      items: [
        { name: "All Deals", href: "/store", feed: "All" },
        { name: "Electronics & Tech", href: "/store?feed=Electronics", feed: "Electronics" },
        { name: "Home & Kitchen", href: "/store?feed=Home", feed: "Home" },
        { name: "Sports & Outdoors", href: "/store?feed=Sports", feed: "Sports" },
        { name: "Tools & Garden", href: "/store?feed=Tools", feed: "Tools" },
        { name: "Clearance Deals", href: "/store?feed=Clearance", feed: "Clearance" },
      ]
    },
    {
      title: "Other Items",
      items: [
        { name: "2nd Hand Items", href: "/secondhand", feed: null },
      ]
    }
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Store Categories</h2>
        
        {totalItems > 0 && (
          <Link href="/cart" className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg block hover:bg-blue-100 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">Cart</span>
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                {totalItems}
              </span>
            </div>
          </Link>
        )}
        
        {menuItems.map((section) => (
          <div key={section.title} className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || 
                  (pathname === "/store" && item.feed === "All") ||
                  pathname.includes(`feed=${item.feed}`);
                
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}