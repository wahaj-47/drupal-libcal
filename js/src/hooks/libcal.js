// libcalHooks.js
import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import libcal from "../services/libcal";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime)

// List of unique keys for caching and tracking
const keys = {
    policies: ["libcal", "policies"],
    footers: ["libcal", "footers"],

    locations: ["libcal", "locations"],
    category: (cid) => ["libcal", "category", cid],
    categories: (lids) => ["libcal", "categories", lids],
    zones: (lids) => ["libcal", "zones", lids],
    items: (lid) => ["libcal", "items", lid],
    space: (sid, availability) => ["libcal", "space", sid, availability],
    form: (fid) => ["libcal", "form", fid],
};

export const useLocations = () =>
    useQuery({ queryKey: keys.locations, queryFn: libcal.getLocations });

export const useCategory = (cid) =>
    useQuery({
        queryKey: keys.category(cid),
        queryFn: () => libcal.getCategory(cid).then(res => res[0] ?? {}),
        enabled: !!cid,
    });

export const useCategories = (lids) =>
    useQueries({
        queries: lids.map(lid => {
            return ({
                queryKey: keys.categories(lid),
                queryFn: () => libcal.getCategories(lid),
                enabled: !!lid,
            })
        }),
        combine: (results) => {
            return ({
                data: results.flatMap((result) => result.data).flatMap(l => l?.categories),
                pending: results.some((result) => result.isPending)
            })
        }
    })

export const useZones = (lids) =>
    useQueries({
        queries: lids.map(lid => {
            return ({
                queryKey: keys.zones(lid),
                queryFn: () => libcal.getZones(lid),
                enabled: !!lid,
            })
        }),
        combine: (results) => {
            return ({
                data: results.flatMap((result) => result.data),
                pending: results.some((result) => result.isPending),
            })
        }
    });

export const useItems = (lids) =>
    useQueries({
        queries: lids.map(lid => {
            return ({
                queryKey: keys.items(lid),
                queryFn: () => libcal.getItems(lid),
                enabled: !!lid,
            })
        }),
        combine: (results) => {
            const combinedItems = results.flatMap((result, index) => {
                const lid = lids[index];
                if (!result.data) return [];

                return result.data.map((item) => {
                    if ("availability" in item && item.availability.length > 0) {
                        const difference = dayjs(item.availability[0].from)
                            .diff(
                                dayjs(),
                                "minute"
                            );

                        return {
                            ...item,
                            availability: difference < 30 ? "now" : "soon",
                            availableIn: dayjs(item.availability[0].from).fromNow(),
                            lid,
                        };
                    }

                    return ({
                        ...item,
                        availability: "unavailable",
                        lid,
                    })
                });
            });

            return {
                data: combinedItems,
                pending: results.some((result) => result.isPending),
            };
        },
    });

export const useSpace = (sid, availability = "next") =>
    useQuery({
        queryKey: keys.space(sid, availability),
        queryFn: () => libcal.getSpace(sid, availability).then(res => res[0] ?? {}),
        enabled: !!sid,
    });

export const useForm = (fid) =>
    useQuery({
        queryKey: keys.form(fid),
        queryFn: () => libcal.getForm(fid).then(res => res[0] ?? {}),
        enabled: !!fid,
    });

// Reserve Mutation
export const useReserve = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: libcal.reserve,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['libcal', 'space'] });
        },
    });
};
