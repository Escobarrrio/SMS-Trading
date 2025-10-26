import Link from 'next/link';

export default function ClientNav() {
  return (
    <nav className="mb-8">
      <ul className="flex flex-wrap gap-3 text-sm">
        <li>
          <Link className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" href="/send">
            Send SMS
          </Link>
        </li>
        <li>
          <Link className="px-3 py-2 rounded bg-white border hover:bg-gray-50" href="/contacts">
            Contacts
          </Link>
        </li>
        <li>
          <Link className="px-3 py-2 rounded bg-white border hover:bg-gray-50" href="/campaigns">
            Campaigns
          </Link>
        </li>
      </ul>
    </nav>
  );
}
