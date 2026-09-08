import useSEO from '../hooks/useSEO';
export default function PrivatePageSEO() {
  useSEO({ title: 'Account | Ta7leel', description: 'Access your Ta7leel account and saved reading.', noindex: true });
  return null;
}
