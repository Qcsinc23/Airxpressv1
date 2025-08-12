// app/components/ui/Breadcrumb.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Simple SVG icons
const ChevronRightIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
  </svg>
);

const HomeIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
  </svg>
);

interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  const pathname = usePathname();
  
  // Auto-generate breadcrumbs if not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/' }
    ];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      // Create readable labels for common paths
      let label = segment.charAt(0).toUpperCase() + segment.slice(1);
      
      // Custom labels for specific routes
      const labelMap: { [key: string]: string } = {
        'quote': 'Get Quote',
        'tracking': 'Track Shipment',
        'dashboard': 'Dashboard',
        'booking': 'Booking',
        'confirmation': 'Confirmation',
        'admin': 'Admin',
        'pricing': 'Pricing Management'
      };

      if (labelMap[segment]) {
        label = labelMap[segment];
      }

      // Handle dynamic routes (IDs)
      if (segment.startsWith('[') && segment.endsWith(']')) {
        label = 'Details';
      } else if (segment.match(/^[A-Z0-9-]+$/i) && segment.length > 8) {
        // Looks like an ID
        label = `#${segment.substring(0, 8)}...`;
      }

      breadcrumbs.push({
        label,
        href: currentPath,
        current: isLast
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {breadcrumbItems.map((item, index) => (
          <li key={item.href} className="inline-flex items-center">
            {index > 0 && (
              <ChevronRightIcon className="w-5 h-5 text-gray-400 mx-1" />
            )}
            
            {item.current ? (
              <span className="flex items-center text-sm font-medium text-gray-500 cursor-default">
                {index === 0 && (
                  <HomeIcon className="w-4 h-4 mr-2" />
                )}
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                {index === 0 && (
                  <HomeIcon className="w-4 h-4 mr-2" />
                )}
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Process-specific breadcrumb configurations
export const QuoteProcessBreadcrumbs = {
  getQuote: [
    { label: 'Home', href: '/' },
    { label: 'Get Quote', href: '/quote', current: true }
  ],
  selectRate: [
    { label: 'Home', href: '/' },
    { label: 'Get Quote', href: '/quote' },
    { label: 'Select Rate', href: '/quote/rates', current: true }
  ],
  bookAndPay: [
    { label: 'Home', href: '/' },
    { label: 'Get Quote', href: '/quote' },
    { label: 'Select Rate', href: '/quote/rates' },
    { label: 'Book & Pay', href: '/quote/booking', current: true }
  ]
};

export const TrackingProcessBreadcrumbs = {
  search: [
    { label: 'Home', href: '/' },
    { label: 'Track Shipment', href: '/tracking', current: true }
  ],
  details: (trackingId: string) => [
    { label: 'Home', href: '/' },
    { label: 'Track Shipment', href: '/tracking' },
    { label: `Tracking ${trackingId}`, href: `/tracking/${trackingId}`, current: true }
  ]
};

export const DashboardBreadcrumbs = {
  main: [
    { label: 'Home', href: '/' },
    { label: 'Dashboard', href: '/dashboard', current: true }
  ],
  admin: [
    { label: 'Home', href: '/' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Admin', href: '/dashboard/admin', current: true }
  ],
  pricing: [
    { label: 'Home', href: '/' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Admin', href: '/dashboard/admin' },
    { label: 'Pricing Management', href: '/dashboard/admin/pricing', current: true }
  ]
};

export const BookingBreadcrumbs = {
  confirmation: (bookingId: string) => [
    { label: 'Home', href: '/' },
    { label: 'Booking', href: '/booking' },
    { label: `Confirmation`, href: `/booking/confirmation/${bookingId}`, current: true }
  ]
};
