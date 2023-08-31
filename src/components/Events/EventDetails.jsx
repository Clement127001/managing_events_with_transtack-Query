import { Link, Outlet, useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

import Header from "../Header.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteEvent, fetchEvent, queryClient } from "../../Util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import Modal from "../UI/Modal.jsx";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isDeleting, setisDeleting] = useState(false);

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => fetchEvent({ signal, id }),
  });

  const {
    mutate,
    isError: isErrorDeletion,
    error: errorDeletion,
    isPending: isPendingDeletion,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "none",
      });
      navigate("/events");
    },
  });

  const startDeletehandler = () => {
    setisDeleting(true);
  };

  const stopDeleteHandler = () => {
    setisDeleting(false);
  };

  const deleteEventHandler = () => {
    mutate({ id });
  };

  let content;

  if (isPending)
    content = (
      <div id="event-details-content" className="center">
        <p>Loading detials...</p>
      </div>
    );

  if (isError)
    content = (
      <div id="event-details-content" className="center">
        <ErrorBlock
          title="Failed to fetch Details"
          message={error.info?.message || "can't able to fetch details"}
        />
      </div>
    );

  if (data) {
    content = (
      <>
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={startDeletehandler}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt="" />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>
                {data.date} @ {data.time}
              </time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {isDeleting && (
        <Modal onClose={stopDeleteHandler}>
          <h1>Are you sure?</h1>
          <p>D you want to delete events, its can be undone.</p>

          {isPendingDeletion && <p>Deleting, please wait...</p>}

          {!isPendingDeletion && (
            <div className="form-actions">
              <button onClick={stopDeleteHandler} className="button-text">
                Cancel
              </button>
              <button onClick={deleteEventHandler} className="button">
                Delete
              </button>
            </div>
          )}

          {isErrorDeletion && (
            <ErrorBlock
              title="Deletion Failed"
              message={
                errorDeletion.info?.message ||
                "Can't able to delete event. Please try after some time"
              }
            />
          )}
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">{content}</article>
    </>
  );
}
