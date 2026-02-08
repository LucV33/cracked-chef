interface GpaRatingProps {
  gpa: number;
}

export default function GpaRating({ gpa }: GpaRatingProps) {
  const color =
    gpa >= 3.0
      ? "bg-green-100 text-green-800"
      : gpa >= 2.0
        ? "bg-yellow-100 text-yellow-800"
        : "bg-red-100 text-red-800";

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-semibold ${color}`}>
      {gpa.toFixed(1)} GPA
    </span>
  );
}
