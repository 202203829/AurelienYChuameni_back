"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./detalle.module.css";
import Layout from "../../componentes/Layout/Layout";
import {
  fetchAuction,
  createBid,
  fetchBidsByAuction,
  createOrUpdateRating,
  fetchGlobalAverageRating,
  fetchComments,
  createComment,
  deleteComment,
  updateComment,
} from "@/lib/api";
import { getToken, getUserId } from "@/lib/auth";
import { format } from "date-fns";

export default function DetalleSubasta() {
  const { id } = useParams();
  const router = useRouter();

  const [subasta, setSubasta] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [puja, setPuja] = useState("");
  const [mensajePuja, setMensajePuja] = useState("");
  const [bids, setBids] = useState([]);
  const [averageRating, setAverageRating] = useState(null);
  const [rating, setRating] = useState(0);
  const [ratingMessage, setRatingMessage] = useState("");
  const [globalAverage, setGlobalAverage] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentTitle, setCommentTitle] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [editCommentId, setEditCommentId] = useState(null);
  const [editCommentTitle, setEditCommentTitle] = useState("");
  const [editCommentContent, setEditCommentContent] = useState("");

  const userId = getUserId();

  useEffect(() => {
    const loadAll = async () => {
      try {
        const data = await fetchAuction(id);
        if (!data?.id) throw new Error("Subasta no encontrada.");
        setSubasta(data);
        setAverageRating(data.average_rating);

        const token = getToken();
        if (token) {
          const allBids = await fetchBidsByAuction(id, token);
          setBids(allBids.sort((a, b) =>
            b.amount === a.amount
              ? new Date(a.timestamp) - new Date(b.timestamp)
              : b.amount - a.amount
          ));

          const commentData = await fetchComments(id, token);
          setComments(commentData);
        }

        const avg = await fetchGlobalAverageRating();
        setGlobalAverage(avg);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar la subasta.");
      } finally {
        setCargando(false);
      }
    };

    if (id) loadAll();
  }, [id]);

  const handlePuja = async () => {
    const pujaValor = parseFloat(puja);
    if (isNaN(pujaValor)) return setMensajePuja("⚠️ Introduce un número válido.");
    if (pujaValor <= subasta.price) return setMensajePuja("❌ La puja debe ser mayor al valor actual.");

    const token = getToken();
    if (!token) return router.push("/login");

    try {
      const bidData = { amount: pujaValor, auction: subasta.id };
      const result = await createBid(bidData, token);

      if (result.amount) {
        setMensajePuja(`✅ Has pujado ${pujaValor}€ correctamente.`);
        setSubasta({ ...subasta, price: pujaValor });
        setPuja("");
        const nuevasPujas = bids.filter(b => b.bidder_username !== result.bidder_username);
        nuevasPujas.unshift(result);
        setBids(nuevasPujas);
      } else {
        setMensajePuja("❌ Error al enviar la puja.");
      }
    } catch {
      setMensajePuja("❌ Error de conexión al pujar.");
    }
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return setRatingMessage("Debes iniciar sesión para valorar.");

    try {
      await createOrUpdateRating(subasta.id, rating, token);
      setRatingMessage("Valoración enviada con éxito.");
    } catch {
      setRatingMessage("Error al enviar la valoración.");
    }
  };

  const handleCreateComment = async () => {
    const token = getToken();
    if (!token) return;

    try {
      await createComment({ auction: id, title: commentTitle, content: commentContent }, token);
      setCommentTitle("");
      setCommentContent("");
      const updated = await fetchComments(id, token);
      setComments(updated);
    } catch (err) {
      console.error("Error al crear comentario:", err);
    }
  };

  const handleEditComment = async () => {
    const token = getToken();
    if (!token || !editCommentId) return;

    try {
      await updateComment(editCommentId, {
        auction: id,
        title: editCommentTitle,
        content: editCommentContent,
      }, token);

      setEditCommentId(null);
      setEditCommentTitle("");
      setEditCommentContent("");
      const updated = await fetchComments(id, token);
      setComments(updated);
    } catch (err) {
      console.error("Error al editar comentario:", err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const token = getToken();
    if (!token) return;

    try {
      await deleteComment(commentId, token);
      const updated = await fetchComments(id, token);
      setComments(updated);
    } catch (err) {
      console.error("Error al eliminar comentario:", err);
    }
  };

  if (cargando) return <Layout><p className={styles.cargando}>Cargando subasta...</p></Layout>;
  if (error) return <Layout><p className={styles.error}>{error}</p></Layout>;

  return (
    <Layout>
      <div className={styles.mainWrapper}>
        <div className={styles.contentPanel}>
          <h1>{subasta.title}</h1>
          <img src={subasta.thumbnail} alt={subasta.title} className={styles.productImage} />
          <p>{subasta.description}</p>
          <p><strong>Valor actual:</strong> {parseFloat(subasta.price).toFixed(2)} €</p>
          <p><strong>Valoración promedio:</strong> {averageRating || "Sin valoraciones"}</p>

          <label>Tu puja:</label>
          <input
            type="number"
            min={subasta.price + 1}
            step="1"
            value={puja}
            onChange={(e) => setPuja(e.target.value)}
            className={styles.inputNumber}
          />
          <button onClick={handlePuja} className={styles.bidButton}>Pujar</button>
          {mensajePuja && <p className={styles.bidMessage}>{mensajePuja}</p>}

          <button onClick={() => router.push("/subastas")} className={styles.volverBtn}>
            ⬅ Volver a subastas
          </button>

          <form onSubmit={handleRatingSubmit} className={styles.ratingForm}>
            <label>Valorar subasta:</label>
            <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
              <option value="0">Selecciona una valoración</option>
              {[1, 2, 3, 4, 5].map(val => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>
            <button type="submit" className={styles.rateButton}>Enviar valoración</button>
          </form>
          {ratingMessage && <p>{ratingMessage}</p>}

          <div className={styles.commentsSection}>
            <h2>💬 Comentarios</h2>
            <input
              type="text"
              placeholder="Título"
              value={commentTitle}
              onChange={(e) => setCommentTitle(e.target.value)}
            />
            <textarea
              placeholder="Escribe tu comentario..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
            />
            <button onClick={handleCreateComment}>Publicar comentario</button>

            <ul className={styles.commentList}>
  {comments.map((comment) => (
    <li key={comment.id} className={styles.commentCard}>
      {editCommentId === comment.id ? (
        <>
          <input
            type="text"
            value={editCommentTitle}
            onChange={(e) => setEditCommentTitle(e.target.value)}
            placeholder="Nuevo título"
            className={styles.commentInput}
          />
          <textarea
            value={editCommentContent}
            onChange={(e) => setEditCommentContent(e.target.value)}
            placeholder="Nuevo comentario"
            className={styles.commentTextarea}
          />
          <div className={styles.commentButtons}>
            <button onClick={handleEditComment} className={styles.saveButton}>Guardar</button>
            <button onClick={() => setEditCommentId(null)} className={styles.cancelButton}>Cancelar</button>
          </div>
        </>
      ) : (
        <>
          <strong>{comment.title}</strong><br />
          {comment.content}<br />
          <small>{format(new Date(comment.created_at), "dd/MM/yyyy HH:mm")}</small>
          {String(comment.user) === String(userId) && (
            <div className={styles.commentButtons}>
              <button
                className={styles.editButton}
                onClick={() => {
                  setEditCommentId(comment.id);
                  setEditCommentTitle(comment.title);
                  setEditCommentContent(comment.content);
                }}
              >
                Editar
              </button>
              <button
                className={styles.deleteButton}
                onClick={() => handleDeleteComment(comment.id)}
              >
                Eliminar
              </button>
            </div>
          )}
        </>
      )}
    </li>
  ))}
</ul>

          </div>
        </div>

        <div className={styles.rightPanel}>
          <div className={styles.extraInfoBox}>
            <h3>📜 Historial de pujas</h3>
            {bids.length === 0 ? (
              <p>No hay pujas todavía.</p>
            ) : (
              <ul>
                {bids.map((bid, index) => (
                  <li key={index}>
                    💰 <strong>{Number(bid.amount).toFixed(2)}€</strong><br />
                    👤 {bid.bidder_username}<br />
                    ⏱ {format(new Date(bid.timestamp), "dd/MM/yyyy HH:mm")}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className={styles.extraInfoBox}>
            <p>⭐ <strong>Valoración media global de subastas:</strong> {globalAverage || "No disponible"}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
