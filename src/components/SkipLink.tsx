export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100]
        bg-amber-500 text-black font-bold text-xl px-6 py-3 rounded-xl"
    >
      ข้ามไปเนื้อหาหลัก
    </a>
  )
}
