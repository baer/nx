import { buildGradleArgs } from './build-gradle-args';
import { GradleExecutorSchema } from './schema';

describe('buildGradleArgs', () => {
  it('should return only --rerun-tasks when no args are provided', () => {
    const options: GradleExecutorSchema = {
      taskName: 'build',
      excludeDependsOn: false,
    };

    const result = buildGradleArgs(options);

    expect(result).toEqual(['--rerun-tasks']);
  });

  it('should parse args from a string with single space delimiter', () => {
    const options: GradleExecutorSchema = {
      taskName: 'build',
      args: '--warning-mode all --stacktrace',
      excludeDependsOn: false,
    };

    const result = buildGradleArgs(options);

    expect(result).toEqual([
      '--warning-mode',
      'all',
      '--stacktrace',
      '--rerun-tasks',
    ]);
  });

  it('should handle args provided as an array', () => {
    const options: GradleExecutorSchema = {
      taskName: 'build',
      args: ['--warning-mode=all', '--stacktrace'],
      excludeDependsOn: false,
    };

    const result = buildGradleArgs(options);

    expect(result).toEqual([
      '--warning-mode=all',
      '--stacktrace',
      '--rerun-tasks',
    ]);
  });

  it('should trim whitespace from string args', () => {
    const options: GradleExecutorSchema = {
      taskName: 'build',
      args: '  --stacktrace   ',
      excludeDependsOn: false,
    };

    const result = buildGradleArgs(options);

    expect(result).toEqual(['--stacktrace', '--rerun-tasks']);
  });

  it('should handle empty string args', () => {
    const options: GradleExecutorSchema = {
      taskName: 'build',
      args: '',
      excludeDependsOn: false,
    };

    const result = buildGradleArgs(options);

    expect(result).toEqual(['--rerun-tasks']);
  });

  it('should handle empty array args', () => {
    const options: GradleExecutorSchema = {
      taskName: 'build',
      args: [],
      excludeDependsOn: false,
    };

    const result = buildGradleArgs(options);

    expect(result).toEqual(['--rerun-tasks']);
  });

  it('should add --tests flag when testClassName is provided', () => {
    const options: GradleExecutorSchema = {
      taskName: 'test',
      testClassName: 'com.example.MyTestClass',
      excludeDependsOn: false,
    };

    const result = buildGradleArgs(options);

    expect(result).toEqual([
      '--tests',
      'com.example.MyTestClass',
      '--rerun-tasks',
    ]);
  });

  it('should combine args and testClassName', () => {
    const options: GradleExecutorSchema = {
      taskName: 'test',
      args: ['--stacktrace'],
      testClassName: 'com.example.MyTestClass',
      excludeDependsOn: false,
    };

    const result = buildGradleArgs(options);

    expect(result).toEqual([
      '--stacktrace',
      '--tests',
      'com.example.MyTestClass',
      '--rerun-tasks',
    ]);
  });

  it('should not forward known schema properties as gradle args', () => {
    const options: GradleExecutorSchema = {
      taskName: 'build',
      excludeDependsOn: true,
      includeDependsOnTasks: ['task1', 'task2'],
      __unparsed__: ['--some-arg'],
      debugMode: true,
      debugPort: 5005,
    };

    const result = buildGradleArgs(options);
    expect(result).toEqual(['--rerun-tasks']);
  });

  it('should pass gradle flags through args as a string', () => {
    const options: GradleExecutorSchema = {
      taskName: 'build',
      args: '--continuous --max-workers=4 --warning-mode=all',
      excludeDependsOn: false,
    };

    const result = buildGradleArgs(options);

    expect(result).toContain('--continuous');
    expect(result).toContain('--max-workers=4');
    expect(result).toContain('--warning-mode=all');
    expect(result).toContain('--rerun-tasks');
  });

  it('should pass gradle flags through args as an array', () => {
    const options: GradleExecutorSchema = {
      taskName: 'build',
      args: ['--continuous', '--max-workers=4', '--warning-mode=all'],
      excludeDependsOn: false,
    };

    const result = buildGradleArgs(options);

    expect(result).toEqual([
      '--continuous',
      '--max-workers=4',
      '--warning-mode=all',
      '--rerun-tasks',
    ]);
  });

  it('should handle complex scenario with args, testClassName, and schema properties', () => {
    const options: GradleExecutorSchema = {
      taskName: 'test',
      args: '--stacktrace --info --offline --max-workers=8',
      testClassName: 'com.example.IntegrationTest',
      excludeDependsOn: true,
      debugMode: true,
      debugPort: 5005,
    };

    const result = buildGradleArgs(options);

    expect(result).toContain('--stacktrace');
    expect(result).toContain('--info');
    expect(result).toContain('--offline');
    expect(result).toContain('--max-workers=8');
    expect(result).toContain('--tests');
    expect(result).toContain('com.example.IntegrationTest');
    expect(result).toContain('--rerun-tasks');
    expect(result).not.toContain('--debugMode');
    expect(result).not.toContain('--debugPort');
  });
});
