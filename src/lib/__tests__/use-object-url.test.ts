import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import {
  revokeObjectUrls,
  useObjectUrlListState,
  useObjectUrlState,
} from "../use-object-url";

describe("use-object-url", () => {
  beforeEach(() => {
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("revokes the previous URL when it is replaced", () => {
    const { result } = renderHook(() => useObjectUrlState());

    act(() => result.current[1]("blob:first"));
    act(() => result.current[1]("blob:second"));

    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:first");
    expect(URL.revokeObjectURL).not.toHaveBeenCalledWith("blob:second");
  });

  it("revokes the current URL when it is set to null", () => {
    const { result } = renderHook(() => useObjectUrlState());

    act(() => result.current[1]("blob:first"));
    act(() => result.current[1](null));

    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:first");
  });

  it("revokes the live URL on unmount", () => {
    const { result, unmount } = renderHook(() => useObjectUrlState());

    act(() => result.current[1]("blob:live"));
    unmount();

    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:live");
  });

  it("revokes only dropped URLs when a list is replaced", () => {
    const { result } = renderHook(() => useObjectUrlListState());

    act(() => result.current[1](["blob:a", "blob:b"]));
    act(() => result.current[1](["blob:b", "blob:c"]));

    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:a");
    expect(URL.revokeObjectURL).not.toHaveBeenCalledWith("blob:b");
    expect(URL.revokeObjectURL).not.toHaveBeenCalledWith("blob:c");
  });

  it("revokes all list URLs on unmount", () => {
    const { result, unmount } = renderHook(() => useObjectUrlListState());

    act(() => result.current[1](["blob:a", "blob:b"]));
    unmount();

    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:a");
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:b");
  });

  it("revokeObjectUrls dedupes duplicate entries", () => {
    revokeObjectUrls(["blob:a", "blob:a", "blob:b"]);

    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:a");
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:b");
  });
});
