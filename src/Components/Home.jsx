import { useState, useEffect } from "react";
import axios from "./api/axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [trendingBooks, setTrendingBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const booksPerPage = 25;

  useEffect(() => {
    const fetchTrendingBooks = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get("/books/search", {
          params: { query: "fantasy" },
          headers: { "x-access-token": token || "" },
        });
        const books = res.data.books || res.data.results || res.data || [];
        setTrendingBooks(books);
        setCurrentPage(1);
      } catch (error) {
        console.error("Trending Books Error:", error);
        toast.error("Failed to fetch trending books.");
      } finally {
        setLoading(false);
      }
    };
    fetchTrendingBooks();
  }, []);

  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = trendingBooks.slice(indexOfFirstBook, indexOfLastBook);

  const nextPage = () => {
    if (indexOfLastBook < trendingBooks.length) setCurrentPage((prev) => prev + 1);
  };
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const getImageUrl = (cover_i) =>
    cover_i
      ? `https://covers.openlibrary.org/b/id/${cover_i}-L.jpg`
      : "https://placehold.co/150x220?text=No+Cover";

  const PageButton = ({ children, ...props }) => (
    <button
      {...props}
      className="px-4 py-2 bg-[#4A2E15] text-[#F5E9D3] text-sm font-medium rounded-md hover:bg-[#6F4520] disabled:bg-[#C9BBA0] disabled:text-[#8A7B5F] transition"
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#F3E9D2]">
      {/* Hero */}
      <div
        className="relative bg-cover bg-center"
        style={{ backgroundImage: "url('/assets/backgroundHome.webp')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#2A1B0F]/70 via-[#2A1B0F]/50 to-[#F3E9D2]" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
          <p className="text-[#E8CE8A] text-xs sm:text-sm tracking-[0.3em] uppercase mb-3">
            Est. in your bookshelf
          </p>
          <h1
            className="text-4xl sm:text-6xl font-bold text-[#FBF6EC] mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Welcome to ShelfMate
          </h1>
          <p className="text-[#EAE0C8] text-sm sm:text-base max-w-xl mx-auto mb-8">
            Your personal library — search, rate, and discover books curated just for you.
          </p>
          <button
            onClick={() => navigate("/search")}
            className="px-8 py-3 bg-[#7A2E2E] text-[#F5E9D3] text-base font-semibold rounded-md hover:bg-[#621F1F] transition shadow-lg"
          >
            Browse the shelves
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-[#D9C9A3]" />
          <h2
            className="text-xl sm:text-2xl font-semibold text-[#3B2A1A] tracking-wide"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            New arrivals
          </h2>
          <div className="h-px flex-1 bg-[#D9C9A3]" />
        </div>

        {loading ? (
          <div className="text-center text-[#6B5B3E] py-8">Restocking the shelves...</div>
        ) : currentBooks.length > 0 ? (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {currentBooks.map((book, index) => (
                <div
                  key={book.key || index}
                  className="bg-[#FBF6EC] border border-[#D9C9A3] rounded-lg shadow-md hover:shadow-xl transition p-3"
                >
                  <img
                    src={getImageUrl(book.cover_i)}
                    alt={book.title || "Book cover"}
                    className="w-full h-40 sm:h-48 object-cover rounded-md mb-2 border border-[#D9C9A3]"
                  />
                  <h3
                    className="text-sm sm:text-base font-semibold text-[#3B2A1A] truncate"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {book.title || "Untitled"}
                  </h3>
                  <p className="text-[#6B5B3E] text-xs italic truncate">
                    {book.author_name ? book.author_name.join(", ") : "Unknown"}
                  </p>
                  <p className="text-[#8A7B5F] text-xs mt-1">
                    {book.first_publish_year || "N/A"}
                  </p>
                </div>
              ))}
            </div>
            {trendingBooks.length > booksPerPage && (
              <div className="flex justify-between mt-6">
                <PageButton onClick={prevPage} disabled={currentPage === 1}>
                  ← Previous
                </PageButton>
                <PageButton
                  onClick={nextPage}
                  disabled={indexOfLastBook >= trendingBooks.length}
                >
                  Next →
                </PageButton>
              </div>
            )}
          </div>
        ) : (
          <p className="text-[#6B5B3E] text-center py-4">No new arrivals right now.</p>
        )}
      </div>

      <ToastContainer position="top-center" theme="dark" />
    </div>
  );
}