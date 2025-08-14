import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { searchMoviesByTitle } from "../movieService";

const API_URL = "/api/movies";

function makeResponse(data, ok = true) {
    return {
        ok,
        json: vi.fn().mockResolvedValue(data),
    };
}

beforeEach(() => {
    vi.stubGlobal("API_URL", API_URL);
    vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

describe("searchMoviesByTitle (service)", () => {
    it("builds URL with encoded title and passes credentials/cache", async () => {
        const data = [{ imdbID: "tt0133093", Title: "The Matrix", Poster: "N/A" }];
        fetch.mockResolvedValueOnce(makeResponse(data, true));

        const res = await searchMoviesByTitle("matrix");

        expect(fetch).toHaveBeenCalledTimes(1);

        const [url, opts] = fetch.mock.calls[0];
        expect(url).toBe(`${API_URL}?title=matrix`);
        expect(opts).toMatchObject({
            credentials: "include",
            cache: "no-store",
        });

        expect(res).toEqual(data);
    });

    it("encodes the query string", async () => {
        fetch.mockResolvedValueOnce(makeResponse([], true));

        await searchMoviesByTitle("the matrix");

        const [url] = fetch.mock.calls[0];
        expect(url).toBe(`${API_URL}?title=the%20matrix`);
    });

    it("throws if response is not ok", async () => {
        fetch.mockResolvedValueOnce(makeResponse({ message: "err" }, false));
        await expect(searchMoviesByTitle("matrix")).rejects.toThrow(
            "Failed to search movies"
        );
    });

    it("returns [] when payload is not an array", async () => {
        fetch.mockResolvedValueOnce(makeResponse({ foo: "bar" }, true));
        const res = await searchMoviesByTitle("matrix");
        expect(res).toEqual([]);
    });

    it("returns [] when title is empty/whitespace", async () => {
        const res = await searchMoviesByTitle("  ");
        expect(res).toEqual([]);
        expect(fetch).not.toHaveBeenCalled();
    });

    it("forwards AbortController signal", async () => {
        const controller = new AbortController();

        fetch.mockImplementationOnce(() => {
            controller.abort();
            const err = new Error("Aborted");
            err.name = "AbortError";
            return Promise.reject(err);
        });

        await expect(
            searchMoviesByTitle("matrix", { signal: controller.signal })
        ).rejects.toThrow();

        const [, opts] = fetch.mock.calls[0];
        expect(opts.signal).toBe(controller.signal);
    });
});
