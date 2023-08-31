import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { fetchEvents } from "../../Util/http";
import ErrorBlock from "../UI/ErrorBlock";
import LoadingIndicator from "../UI/LoadingIndicator";
import EventItem from "./EventItem";

export default function FindEventSection() {
  const searchElement = useRef();
  //to avoid intial request to send , we want it to be undefined
  const [searchTerm, setSearchTerm] = useState();

  const { data, isError, isLoading, error } = useQuery({
    queryKey: ["events", { searchTerm: searchTerm }],
    queryFn: ({ signal, queryKey }) => fetchEvents({ signal, ...queryKey[1] }),
    enabled: searchTerm !== undefined,
  });

  function handleSubmit(event) {
    event.preventDefault();
    setSearchTerm(searchElement.current.value);
  }

  let content = <p>Please enter a search term and to find events.</p>;

  if (isLoading) content = <LoadingIndicator />;

  if (isError)
    content = (
      <ErrorBlock
        title="error ocuured while fetching event"
        message={error.info?.message || "can't able to find the events"}
      />
    );

  if (data && !isError && !isLoading)
    content = (
      <ul className="events-list">
        {data.map((event) => (
          <li key={event.title}>
            <EventItem event={event} />
          </li>
        ))}
      </ul>
    );

  return (
    <section className="content-section" id="all-events-section">
      <header>
        <h2>Find your next event!</h2>
        <form onSubmit={handleSubmit} id="search-form">
          <input
            type="search"
            placeholder="Search events"
            ref={searchElement}
          />
          <button>Search</button>
        </form>
      </header>
      {content}
    </section>
  );
}
