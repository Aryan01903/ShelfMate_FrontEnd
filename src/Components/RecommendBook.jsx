import { normalizeWorkKey } from "./searchBook";

export const renderRecommendBookCard = (book, index) => {
  const workKey = normalizeWorkKey(book.work_key);
  const key = workKey ? `${workKey}-${index}` : `recommend-${index}`;
  const callNumber = workKey ? workKey.replace(/^OL|W$/g, "") : "000";

  return (
    <div
      key={key}
      className="group relative bg-[#FBF6EC] border border-[#D9C9A3] rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
    >
      <div className="absolute left-0 top-0 h-full w-2 bg-gradient-to-b from-[#8B5E34] via-[#6F4520] to-[#4A2E15]" />

      <div className="absolute top-0 right-0 bg-[#7A2E2E] text-[#F5E9D3] text-[10px] font-semibold tracking-wider uppercase px-2 py-1 rounded-bl-md">
        Recommended
      </div>

      <div className="pl-5 pr-4 pt-8 pb-4">
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-20 sm:w-24 overflow-hidden rounded shadow-sm border border-[#D9C9A3]">
            <img
              src={book.cover_image || "https://placehold.co/150x220?text=No+Cover"}
              alt={book.title || "Book cover"}
              className="w-full h-28 sm:h-36 object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/150x220?text=No+Cover";
              }}
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-[#9C7B4A] tracking-widest font-medium mb-1">
              CALL NO. {callNumber}
            </p>
            <h3
              className="text-base sm:text-lg font-semibold text-[#3B2A1A] leading-snug line-clamp-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {book.title || "Untitled"}
            </h3>
            <p className="text-[#6B5B3E] text-xs mt-1 italic">
              {book.author || "Unknown"}
            </p>
          </div>
        </div>

        {book.reason && (
          <div className="mt-3 border-t border-dashed border-[#D9C9A3] pt-3">
            <p className="text-[#5C4A2E] text-xs leading-relaxed">
              <span className="font-semibold text-[#7A2E2E]">Why: </span>
              {book.reason === "Most liked in database"
                ? "Most liked book in ShelfMate"
                : book.reason}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};