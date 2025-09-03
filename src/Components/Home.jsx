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
          headers: {
            "x-access-token": token || "",
          },
        });

        console.log("Trending Books Response:", res.data);
        const books = res.data.books || res.data.results || res.data || [];
        setTrendingBooks(books);
        setCurrentPage(1);
        setLoading(false);
      } catch (error) {
        console.error("Trending Books Error:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        toast.error("Failed to fetch trending books.");
        setLoading(false);
      }
    };

    fetchTrendingBooks();
  }, []);

  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = trendingBooks.slice(indexOfFirstBook, indexOfLastBook);

  const nextPage = () => {
    if (indexOfLastBook < trendingBooks.length) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const getImageUrl = (cover_i) => {
    return cover_i
      ? `https://covers.openlibrary.org/b/id/${cover_i}-L.jpg`
      : "https://via.placeholder.com/150";
  };

  const handleSearchRedirect = () => {
    navigate("/search");
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center p-4"
      style={{
        backgroundImage: "url('/assets/backgroundHome.webp')",
        backgroundAttachment: "fixed",
        backgroundColor: "#f0f0f0",
      }}
    >
      <div className="max-w-5xl mx-auto bg-white/30 backdrop-blur-0 p-6 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-white mb-6 text-center">
          📚 Welcome to ShelfMate
        </h1>
        <div className="flex justify-center mb-8">
          <button
            onClick={handleSearchRedirect}
            className="px-6 py-3 bg-cyan-600 text-white text-lg font-semibold rounded-md hover:bg-cyan-500 transition"
          >
            Search Books 🔍
          </button>
        </div>

        <h2 className="text-2xl font-semibold text-white mb-4 text-center">
          Trending Books
        </h2>

        {loading ? (
          <div className="text-center text-white text-lg">Loading...</div>
        ) : currentBooks.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {currentBooks.map((book, index) => (
                <div
                  key={book.key || index}
                  className="bg-white/90 p-4 rounded-xl shadow-lg hover:shadow-2xl transition cursor-pointer"
                >
                  <img
                    src={getImageUrl(book.cover_i)}
                    alt={book.title || "Book cover"}
                    className="w-full h-48 object-cover rounded-md mb-2"
                  />
                  <h3 className="text-lg font-semibold text-gray-800 truncate">
                    {book.title || "Untitled"}
                  </h3>
                  <p className="text-gray-600 text-sm truncate">
                    Author: {book.author_name ? book.author_name.join(", ") : "Unknown"}
                  </p>
                  <p className="text-gray-700 text-xs">
                    📅 Year: {book.first_publish_year || "N/A"}
                  </p>
                  <p className="text-yellow-600 text-sm mt-1">
                    ⭐ Rating: {book.rating || "Not rated"}
                  </p>
                </div>
              ))}
            </div>
            {trendingBooks.length > booksPerPage && (
              <div className="flex justify-between mt-6">
                <button
                  onClick={prevPage}
                  className="px-4 py-2 bg-cyan-600 text-white rounded-md disabled:bg-cyan-300"
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <button
                  onClick={nextPage}
                  className="px-4 py-2 bg-cyan-600 text-white rounded-md disabled:bg-cyan-300"
                  disabled={indexOfLastBook >= trendingBooks.length}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-white text-center">No trending books available.</p>
        )}

        <ToastContainer position="top-center" theme="dark" />
      </div>
    </div>
  );
}