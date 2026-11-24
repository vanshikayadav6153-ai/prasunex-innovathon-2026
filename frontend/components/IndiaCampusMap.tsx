"use client";

import { FormEvent, useState } from "react";
import {
  Compass,
  ExternalLink,
  MapPin,
  Search,
} from "lucide-react";

const INDIA_MAP_EMBED_URL =
  "https://www.openstreetmap.org/export/embed.html?bbox=68.1%2C6.5%2C97.4%2C35.7&layer=mapnik&marker=22.9734%2C78.6563";

export function IndiaCampusMap() {
  const [query, setQuery] = useState("");
  const [searchUrl, setSearchUrl] = useState("");
  const [error, setError] = useState("");

  const searchGoogleMaps = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const searchTerm = query.trim();

    if (!searchTerm) {
      setError("Enter a city, college, or place to search.");
      return;
    }

    setError("");
    const url = new URL("https://www.google.com/maps/search/");
    url.searchParams.set("api", "1");
    url.searchParams.set("query", `${searchTerm} India`);
    setSearchUrl(url.toString());
    window.open(url.toString(), "_blank", "noopener,noreferrer");
  };

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-[#CDEBDD] bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#CDEBDD] bg-[#F0FAF5] px-3 py-1 text-xs font-semibold text-[#047857]">
              <Compass className="h-3.5 w-3.5" aria-hidden="true" />
              India-wide exploration
            </div>
            <h1 className="mt-3 text-2xl font-extrabold text-[#0B2E22] sm:text-3xl">
              Explore campuses across India
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#4B6B5E]">
              Search for any city, college, or university. This map is not tied
              to a particular institution.
            </p>
          </div>

          <form
            onSubmit={searchGoogleMaps}
            className="w-full lg:max-w-xl"
            role="search"
          >
            <label
              htmlFor="india-map-search"
              className="mb-1.5 block text-xs font-semibold text-[#0B2E22]"
            >
              Search places in India
            </label>
            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1">
                <Search
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A968A]"
                  aria-hidden="true"
                />
                <input
                  id="india-map-search"
                  type="search"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setError("");
                  }}
                  placeholder="Try a city or college name"
                  className="h-11 w-full rounded-xl border border-[#CDEBDD] bg-white pl-9 pr-3 text-sm text-[#0B2E22] outline-none transition placeholder:text-[#7A968A] focus:border-[#34D399] focus:ring-2 focus:ring-[#34D399]/25"
                  aria-describedby={error ? "india-map-search-error" : undefined}
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-[#FACC15] px-4 text-sm font-bold text-[#0B2E22] transition hover:bg-[#EAB308] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]"
              >
                <MapPin className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Search Maps</span>
                <span className="sm:hidden">Search</span>
              </button>
            </div>
            {error && (
              <p
                id="india-map-search-error"
                role="alert"
                className="mt-1.5 text-xs font-medium text-red-700"
              >
                {error}
              </p>
            )}
            {searchUrl && (
              <a
                href={searchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#047857] underline underline-offset-2"
              >
                If Maps did not open, use this search link
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            )}
          </form>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#CDEBDD] bg-white shadow-sm">
        <iframe
          title="Map preview of India"
          src={INDIA_MAP_EMBED_URL}
          className="block h-[55vh] min-h-[360px] w-full border-0 sm:h-[620px]"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        <div className="flex flex-col gap-1 border-t border-[#CDEBDD] bg-[#F0FAF5] px-4 py-3 text-xs text-[#4B6B5E] sm:flex-row sm:items-center sm:justify-between">
          <span>
            Map preview by{" "}
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#047857] underline underline-offset-2"
            >
              OpenStreetMap
            </a>
            . Place searches open in Google Maps.
          </span>
          <span>No Google Maps API key required for search.</span>
        </div>
      </div>
    </section>
  );
}
