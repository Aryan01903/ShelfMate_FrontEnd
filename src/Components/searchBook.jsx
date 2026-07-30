import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "./api/axios";
import { renderRecommendBookCard } from "./RecommendBook";

export const normalizeWorkKey = (workKey) => {
  if (!workKey) return null;
  let normalized = workKey.trim();
  if (normalized.startsWith("/works/")) {
    normalized = normalized.replace(/^\/works\//, "");
  }
  normalized = normalized.toUpperCase();
  if (!/^OL\d+W$/.test(normalized)) {
    console.warn(`Invalid work_key format: ${normalized}`);
    return null;
  }
  return normalized;
};

const SectionDivider = ({ label }) => (
  <div className="flex items-center gap-3 my-6">
    <div className="h-px flex-1 bg-[#D9C9A3]" />
    <span
      className="text-[#7A5B33] text-xs sm:text-sm tracking-[0.2em] uppercase font-medium px-2"
      style={{ fontFamily: "'Playfair Display', serif" }}
    >
      {label}
    </span>
    <div className="h-px flex-1 bg-[#D9C9A3]" />
  </div>
);

export default function SearchBook() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [ratings, setRatings] = useState({});
  const [reviews, setReviews] = useState({});
  const [recommendBooks, setRecommendBooks] = useState([]);
  const [recommendLoader, setRecommendLoader] = useState(false);

  useEffect(() => {
    const fetchRecommendedBooks = async () => {
      setRecommendLoader(true);
      const token = localStorage.getItem("token");
      try {
        const res = await axiosInstance.get("/books/recommendBooks", {
          token,
        });
        const books = res.data.recommendations || [];
        setRecommendBooks(books);
      } catch (err) {
        console.log("Some Error Occurred while fetching recommended Book", err);
        toast.error("Failed to fetch Recommended Books for You!!!");
      } finally {
        setRecommendLoader(false);
      }
    };
    fetchRecommendedBooks();
  }, []);

  const booksPerPage = 20;

  const getImageUrl = (cover_i) =>
    cover_i
      ? `https://covers.openlibrary.org/b/id/${cover_i}-L.jpg`
      : "https://placehold.co/150x220?text=No+Cover";

  const fetchRatingsForBooks = async (bookList) => {
    const token = localStorage.getItem("token");
    if (!token) return {};

    const workKeys = bookList
      .map((book) => normalizeWorkKey(book.work_key || book.key))
      .filter(Boolean);

    if (!workKeys.length) return {};

    try {
      const res = await axiosInstance.get("/books/rate", {
        params: { work_keys: workKeys.join(",") },
        headers: { "x-access-token": token },
      });
      return res.data.ratings || {};
    } catch (error) {
      console.error("Rating Fetch Error:", error);
      toast.error("Failed to fetch ratings and reviews.");
      return {};
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error("Please enter a search term");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to search books");
        setLoading(false);
        return;
      }

      const res = await axiosInstance.get("/books/search", {
        params: { query: searchTerm },
        headers: { "x-access-token": token },
      });

      const books =
        res.data.books || res.data.docs || res.data.results || res.data || [];

      const normalizedBooks = books.map((book) => ({
        ...book,
        work_key: normalizeWorkKey(book.work_key || book.key),
      }));

      const ratingMap = await fetchRatingsForBooks(normalizedBooks);

      const booksWithRatings = normalizedBooks.map((book) => ({
        ...book,
        averageRating: ratingMap[book.work_key]?.averageRating || null,
        ratings: ratingMap[book.work_key]?.ratings || [],
      }));

      setResults(booksWithRatings);
      setCurrentPage(1);
    } catch (error) {
      console.error("Search Error:", error);
      toast.error("Failed to fetch books.");
    } finally {
      setLoading(false);
    }
  };

  const handleRating = async (workKey, rating, review) => {
    const normalizedWorkKey = normalizeWorkKey(workKey);
    if (!normalizedWorkKey) {
      toast.error("Invalid work_key format");
      return;
    }
    if (!rating || rating < 1 || rating > 5) {
      toast.error("Please enter a rating between 1 and 5");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to rate books");
      return;
    }

    try {
      const res = await axiosInstance.post(
        "/books/rate",
        { work_key: normalizedWorkKey, rating: parseFloat(rating), review },
        { headers: { "x-access-token": token } }
      );

      toast.success("Book rated successfully!");

      setResults((prev) =>
        prev.map((book) =>
          book.work_key === normalizedWorkKey
            ? {
                ...book,
                averageRating: res.data.book.averageRating || parseFloat(rating),
                ratings: res.data.book.ratings || [],
              }
            : book
        )
      );
      setRatings((prev) => ({ ...prev, [normalizedWorkKey]: "" }));
      setReviews((prev) => ({ ...prev, [normalizedWorkKey]: "" }));
    } catch (error) {
      console.error("Rating Error:", error);
      toast.error("Failed to rate book. Please try again.");
    }
  };

  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = results.slice(indexOfFirstBook, indexOfLastBook);

  const nextPage = () => {
    if (indexOfLastBook < results.length) setCurrentPage((prev) => prev + 1);
  };
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const PageButton = ({ children, ...props }) => (
    <button
      {...props}
      className="px-4 py-2 bg-[#4A2E15] text-[#F5E9D3] text-sm font-medium rounded-md hover:bg-[#6F4520] disabled:bg-[#C9BBA0] disabled:text-[#8A7B5F] transition"
    >
      {children}
    </button>
  );

  const renderSearchBookCard = (book, index) => {
    const workKey = normalizeWorkKey(book.work_key);
    const key = workKey ? `${workKey}-${index}` : `search-${index}`;

    return (
      <div
        key={key}
        className="relative bg-[#FBF6EC] border border-[#D9C9A3] rounded-lg shadow-md hover:shadow-xl transition p-4"
      >
        <img
          src={book.coverImage || getImageUrl(book.cover_i)}
          alt={book.title || "Book cover"}
          className="w-full h-44 sm:h-52 object-cover rounded-md mb-3 border border-[#D9C9A3]"
        />
        <h3
          className="text-base sm:text-lg font-semibold text-[#3B2A1A] leading-snug"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {book.title || "Untitled"}
        </h3>
        <p className="text-[#6B5B3E] text-sm italic mt-1">
          {book.author_name
            ? book.author_name.join(", ")
            : book.authors?.join(", ") || "Unknown"}
        </p>
        <p className="text-[#8A7B5F] text-xs mt-1">
          Published: {book.first_publish_year || "N/A"}
        </p>
        <p className="text-[#B8860B] text-sm mt-1 font-medium">
          ★ {book.averageRating ? book.averageRating.toFixed(1) : "Not rated"}
        </p>

        <div className="mt-3 border-t border-dashed border-[#D9C9A3] pt-2">
          <h4 className="text-xs font-semibold text-[#5C4A2E] uppercase tracking-wide mb-1">
            Reader notes
          </h4>
          {book.ratings?.length > 0 ? (
            <ul className="space-y-1 text-[#6B5B3E] text-xs max-h-20 overflow-y-auto pr-1">
              {book.ratings
                .filter((r) => r.review)
                .map((r, i) => (
                  <li key={i} className="border-l-2 border-[#D9C9A3] pl-2">
                    {r.review} <span className="text-[#B8860B]">({r.rating})</span>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-[#8A7B5F] text-xs">No reviews yet.</p>
          )}
        </div>

        {workKey && (
          <div className="mt-3 space-y-2">
            <input
              type="number"
              min="1"
              max="5"
              step="0.5"
              value={ratings[workKey] || ""}
              onChange={(e) =>
                setRatings((prev) => ({ ...prev, [workKey]: e.target.value }))
              }
              placeholder="Rate 1-5"
              className="w-full p-2 rounded-md border border-[#D9C9A3] bg-white text-sm text-[#3B2A1A] focus:outline-none focus:ring-2 focus:ring-[#8B5E34]"
            />
            <textarea
              value={reviews[workKey] || ""}
              onChange={(e) =>
                setReviews((prev) => ({ ...prev, [workKey]: e.target.value }))
              }
              placeholder="Write a review..."
              className="w-full p-2 rounded-md border border-[#D9C9A3] bg-white text-sm text-[#3B2A1A] h-16 focus:outline-none focus:ring-2 focus:ring-[#8B5E34]"
            />
            <button
              onClick={() =>
                handleRating(book.work_key, ratings[workKey], reviews[workKey])
              }
              className="w-full bg-[#4A6B3E] text-white text-sm py-2 rounded-md hover:bg-[#3A5530] transition font-medium"
            >
              Submit rating and review
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F3E9D2] p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1
            className="text-3xl sm:text-4xl font-bold text-[#3B2A1A] mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Search the stacks
          </h1>
          <p className="text-[#6B5B3E] text-sm">
            Find your next read from thousands of titles
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch gap-3 mb-8 max-w-2xl mx-auto">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search by title or author..."
            className="flex-1 px-4 py-3 rounded-md border border-[#D9C9A3] bg-[#FBF6EC] text-[#3B2A1A] placeholder-[#9C8B6A] focus:outline-none focus:ring-2 focus:ring-[#8B5E34]"
          />
          <button
            type="submit"
            onClick={handleSearch}
            className="px-6 py-3 bg-[#7A2E2E] text-[#F5E9D3] font-medium rounded-md hover:bg-[#621F1F] transition"
          >
            Search
          </button>
        </div>

        {loading ? (
          <div className="text-center text-[#6B5B3E] py-8">Searching the archives...</div>
        ) : currentBooks.length > 0 ? (
          <div>
            <SectionDivider label="Search results" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {currentBooks.map((book, i) => renderSearchBookCard(book, i))}
            </div>
            {results.length > booksPerPage && (
              <div className="flex justify-between mt-6">
                <PageButton onClick={prevPage} disabled={currentPage === 1}>
                  ← Previous
                </PageButton>
                <PageButton
                  onClick={nextPage}
                  disabled={indexOfLastBook >= results.length}
                >
                  Next →
                </PageButton>
              </div>
            )}
          </div>
        ) : (
          <p className="text-[#6B5B3E] text-center py-4">No books found yet — try a search above.</p>
        )}

        <div className="mt-10">
          <SectionDivider label="Recommended for you" />
          {recommendLoader ? (
            <div className="text-center text-[#6B5B3E] py-8">Consulting the librarian...</div>
          ) : recommendBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {recommendBooks.map((book, i) => renderRecommendBookCard(book, i))}
            </div>
          ) : (
            <p className="text-[#6B5B3E] text-center py-4">
              Rate a few books to get personalized recommendations.
            </p>
          )}
        </div>

        <ToastContainer position="top-center" theme="dark" />
      </div>
    </div>
  );
}