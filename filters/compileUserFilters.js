// server/filters/compileUserFilters.js
import { USER_FILTER_FIELDS } from "./userFilterConfig.js";

export function compileCondition(cond) {
  const field = USER_FILTER_FIELDS[cond.field];
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

    case "is_true":
      return { [path]: true };

    case "is_false":
      return { [path]: false };

    case "contains_any":
      return { [path]: { $in: cond.values } };

    case "contains_none":
      return { [path]: { $nin: cond.values } };

    default:
      return null;
  }
}

// export function compileGroup(group) {
//   const compiledConditions = group.conditions
//     .map(compileCondition)
//     .filter(Boolean);

//   if (!compiledConditions.length) return null;

//   return group.logic === "OR"
//     ? { $or: compiledConditions }
//     : { $and: compiledConditions };
// }
export function compileGroup(group) {
  if (!group.conditions?.length) return null;

  let current = null;

  for (let i = 0; i < group.conditions.length; i++) {
    const cond = group.conditions[i];
    const compiled = compileCondition(cond);

    if (!compiled) continue;

    if (current === null) {
      current = compiled;
      continue;
    }

    const prevLogic = group.conditions[i - 1]?.logic || "AND";

    if (prevLogic === "OR") {
      current = { $or: [current, compiled] };
    } else {
      current = { $and: [current, compiled] };
    }
  }

  return current;
}

export function compileAdvancedFilter(filter) {
  if (!filter?.groups?.length) return {};

  const mongo = [];
  let current = compileGroup(filter.groups[0]);

  for (let i = 1; i < filter.groups.length; i++) {
    const prevLogic = filter.groups[i - 1].logic || "AND";
    const next = compileGroup(filter.groups[i]);
    if (!next) continue;

    if (prevLogic === "OR") {
      current = { $or: [current, next] };
    } else {
      current = { $and: [current, next] };
    }
  }

  return current || {};
}
