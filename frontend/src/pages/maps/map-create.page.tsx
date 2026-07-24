import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Field, TextAreaInput, TextInput } from '../../components/ui/field';
import { simpleMapCreateSchema, type SimpleMapCreateForm } from '../../modules/map-editor/map-editor.schema';
import { defaultColumnCode, defaultRowCode } from '../../modules/map-editor/utils/axis-labels';
import { rackMapApi } from '../../services/rackmap-api';

export function MapCreatePage() {
  const navigate = useNavigate();
  const form = useForm<SimpleMapCreateForm>({
    resolver: zodResolver(simpleMapCreateSchema),
    defaultValues: {
      name: '',
      description: '',
      columnCount: 12,
      rowCount: 30
    }
  });

  async function onSubmit(data: SimpleMapCreateForm) {
    const columnWidth = 64;
    const rowHeight = 32;
    const map = await rackMapApi.createMap({
      name: data.name,
      description: data.description?.trim() || null,
      width: data.columnCount * columnWidth,
      height: data.rowCount * rowHeight,
      gridEnabled: true
    });

    await rackMapApi.setAxes(map.id, {
      columns: Array.from({ length: data.columnCount }, (_, index) => ({
        code: defaultColumnCode(index),
        label: defaultColumnCode(index),
        sortOrder: index + 1,
        width: columnWidth,
        visible: true
      })),
      rows: Array.from({ length: data.rowCount }, (_, index) => ({
        code: defaultRowCode(index, data.rowCount),
        label: defaultRowCode(index, data.rowCount),
        sortOrder: index + 1,
        height: rowHeight,
        visible: true
      }))
    });

    navigate(`/maps/${map.id}/edit`);
  }

  return (
    <section className="page-stack map-create-page">
      <div className="page-heading map-create-heading">
        <div>
          <h1>Criar mapa</h1>
          <p>Defina os dados iniciais da planta. Os rotulos serao editados no editor visual.</p>
        </div>
      </div>

      <form className="wizard-layout compact" onSubmit={form.handleSubmit(onSubmit)}>
        <section className="form-section">
          <div className="form-grid">
            <Field label="Nome do mapa" required>
              <TextInput {...form.register('name')} />
              {form.formState.errors.name ? <p className="error-text">{form.formState.errors.name.message}</p> : null}
            </Field>
            <Field label="Descrição">
              <TextAreaInput rows={4} {...form.register('description')} />
              {form.formState.errors.description ? <p className="error-text">{form.formState.errors.description.message}</p> : null}
            </Field>
            <Field label="Largura em blocos" required>
              <TextInput min={1} type="number" {...form.register('columnCount', { valueAsNumber: true })} />
              {form.formState.errors.columnCount ? <p className="error-text">{form.formState.errors.columnCount.message}</p> : null}
            </Field>
            <Field label="Altura em blocos" required>
              <TextInput min={1} type="number" {...form.register('rowCount', { valueAsNumber: true })} />
              {form.formState.errors.rowCount ? <p className="error-text">{form.formState.errors.rowCount.message}</p> : null}
            </Field>
          </div>
          <Button disabled={form.formState.isSubmitting} type="submit" variant="primary">
            Criar grade
          </Button>
        </section>
      </form>
    </section>
  );
}
