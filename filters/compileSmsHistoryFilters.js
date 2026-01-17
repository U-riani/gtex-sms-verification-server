// server/filters/compileSmsHistoryFilters.js
import { SMS_HISTORY_FILTER_FIELDS } from "./smsHistoryFilterConfig.js";

function compileCondition(cond) {
  const field = SMS_HISTORY_FILTER_FIELDS[cond.field];
  if (!field) return null;

  const path = field.path;

  switch (cond.operator) {
    case "contains":
      return { [path]: { $regex: cond.value, $options: "i" } };

    case "not_contains":
      return { [path]: { $not: { $regex: cond.value, $options: "i" } } };

    case "eq":
      return { [path]: cond.value };

    case "neq":
      return { [path]: { $ne: cond.value } };

    case "in":
      return { [path]: { $in: cond.values } };

    case "not_in":
      return { [path]: { $nin: cond.values } };

    case "before":
      return { [path]: { $lt: new Date(cond.value) } };

    case "after":
      return { [path]: { $gt: new Date(cond.value) } };

    case "between":
      return {
        [path]: {
          $gte: new Date(cond.values[0]),
          $lte: new Date(cond.values[1]),
        },
      };

    default:
      return null;
  }
}

function compileGroup(group) {
  if (!group.conditions?.length) return null;

  let current = null;

  for (let i = 0; i < group.conditions.length; i++) {
    const cond = group.conditions[i];
    const compiled = compileCondition(cond);
    if (!compiled) continue;

    if (!current) {
      current = compiled;
      continue;
    }

    const logic = group.conditions[i - 1]?.logic || "AND";

    current =
      logic === "OR"
        ? { $or: [current, compiled] }
        : { $and: [current, compiled] };
  }

  return current;
}

export function compileSmsHistoryAdvancedFilter(filter) {
  if (!filter?.groups?.length) return {};

  let current = compileGroup(filter.groups[0]);

  for (let i = 1; i < filter.groups.length; i++) {
    const logic = filter.groups[i - 1].logic || "AND";
    const next = compileGroup(filter.groups[i]);
    if (!next) continue;

    current =
      logic === "OR"
        ? { $or: [current, next] }
        : { $and: [current, next] };
  }

  return current || {};
}
