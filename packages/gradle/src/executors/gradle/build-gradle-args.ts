import { GradleExecutorSchema } from './schema';

const schema = require('./schema.json');

const schemaFields = Object.keys(schema.properties);

/**
 * Filters out schema-defined args from unparsed overrides.
 * Schema args are already handled via the options object.
 */
export function filterUnparsedOverrides(unparsedOverrides: string[]): string[] {
  return unparsedOverrides.filter(
    (arg) => !schemaFields.some((field) => arg.startsWith(`--${field}`))
  );
}

export function buildGradleArgs(options: GradleExecutorSchema): string[] {
  let args =
    typeof options.args === 'string'
      ? options.args.trim().split(' ').filter(arg => arg.length > 0)
      : Array.isArray(options.args)
        ? options.args
        : [];

  if (options.testClassName) {
    args.push(`--tests`, options.testClassName);
  }

  // Skip Gradle caching since we use Nx caching
  args.push('--rerun-tasks');

  // Pass any additional options not defined in the schema as gradle arguments
  const knownOptions = new Set(Object.keys(schema.properties));
  Object.entries(options).forEach(([key, value]) => {
    if (!knownOptions.has(key) && value !== undefined && value !== false) {
      if (value === true) {
        // Boolean flags like --continuous
        args.push(`--${key}`);
      } else {
        // Flags with values like --max-workers=4
        args.push(`--${key}=${value}`);
      }
    }
  });

  return args;
}
