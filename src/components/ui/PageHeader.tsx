type Props = { title: string; buttonText?: string; onClick?: () => void; };
export default function PageHeader({ title, buttonText, onClick }: Props) {
  return <div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold">{title}</h2>{buttonText && onClick && <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={onClick}>{buttonText}</button>}</div>;
}
