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

export function compileGroup(group) {
  const compiledConditions = group.conditions
    .map(compileCondition)
    .filter(Boolean);

  if (!compiledConditions.length) return null;

  return group.logic === "OR"
    ? { $or: compiledConditions }
    : { $and: compiledConditions };
}

export function compileAdvancedFilter(filter) {
  if (!filter?.groups?.length) return {};

  const compiled = [];

  filter.groups.forEach((group, index) => {
    const compiledGroup = compileGroup(group);
    if (!compiledGroup) return;

    if (index === 0) {
      compiled.push(compiledGroup);
      return;
    }

    const prevLogic = filter.groups[index - 1].logic || "AND";

    const last = compiled.pop();

    compiled.push(
      prevLogic === "OR"
        ? { $or: [last, compiledGroup] }
        : { $and: [last, compiledGroup] }
    );
  });

  return compiled[0] || {};
}
