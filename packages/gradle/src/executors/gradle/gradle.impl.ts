import { ExecutorContext, workspaceRoot } from '@nx/devkit';
import { GradleExecutorSchema } from './schema';
import {
  findGradlewFile,
  getCustomGradleExecutableDirectoryFromPlugin,
} from '../../utils/exec-gradle';
import { dirname, join } from 'node:path';
import runCommandsImpl from 'nx/src/executors/run-commands/run-commands.impl';
import { getExcludeTasks } from './get-exclude-task';
import { buildGradleArgs } from './build-gradle-args';

export default async function gradleExecutor(
  options: GradleExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> {
  let projectRoot =
    context.projectGraph.nodes[context.projectName]?.data?.root ?? context.root;
  const customGradleExecutableDirectory =
    getCustomGradleExecutableDirectoryFromPlugin(context.nxJsonConfiguration);

  let gradlewPath = findGradlewFile(
    join(projectRoot, 'project.json'),
    workspaceRoot,
    customGradleExecutableDirectory
  ); // find gradlew near project root
  gradlewPath = join(context.root, gradlewPath);

  const args = buildGradleArgs(options);

  if (options.excludeDependsOn) {
    const includeDependsOnTasks = new Set(options.includeDependsOnTasks ?? []);
    getExcludeTasks(
      new Set([`${context.projectName}:${context.targetName}`]),
      context.projectGraph.nodes,
      new Set(),
      includeDependsOnTasks
    ).forEach((task) => {
      if (task) {
        args.push('--exclude-task', task);
      }
    });
  }

  try {
    const { success } = await runCommandsImpl(
      {
        command: `${gradlewPath} ${options.taskName}`,
        cwd: dirname(gradlewPath),
        args: args,
        __unparsed__: options.__unparsed__ || [],
      },
      context
    );
    return { success };
  } catch (e) {
    return { success: false };
  }
}
